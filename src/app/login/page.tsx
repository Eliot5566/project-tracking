'use client';

import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Checkbox,
  Typography,
  Space,
  Divider,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toBase64URL, fromBase64URL } from '@/lib/base64url';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();
  const [requiresWebAuthn, setRequiresWebAuthn] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [initialUser, setInitialUser] = useState<any>(null);
  const [platformSupported, setPlatformSupported] = useState<boolean | null>(
    null
  );
  const [conditionalTried, setConditionalTried] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/auth/me');
        const j = await r.json();
        if (j.success) {
          setInitialUser(j.data);
          localStorage.setItem('isLogin', '1');
          localStorage.setItem('user', JSON.stringify(j.data));
          window.location.href = '/';
        }
      } catch {}
    })();
    (async () => {
      // 改用 PublicKeyCredential API 檢查，並輸出診斷
      if (typeof window === 'undefined') return;
      const debug = (msg: string, data?: any) => {
        if (process.env.NEXT_PUBLIC_WEBAUTHN_DEBUG === '1') {
          console.log('[WebAuthn][support]', msg, data || '');
        }
      };
      if (!window.isSecureContext) {
        debug('not secure context');
        setPlatformSupported(false);
        return;
      }
      if (!(window as any).PublicKeyCredential) {
        debug('PublicKeyCredential missing');
        setPlatformSupported(false);
        return;
      }
      const PKC: any = (window as any).PublicKeyCredential;
      if (
        typeof PKC.isUserVerifyingPlatformAuthenticatorAvailable !== 'function'
      ) {
        debug('isUserVerifyingPlatformAuthenticatorAvailable missing');
        setPlatformSupported(false);
        return;
      }
      try {
        const avail = await PKC.isUserVerifyingPlatformAuthenticatorAvailable();
        debug('platform available?', avail);
        setPlatformSupported(!!avail);
      } catch (e) {
        debug('availability check threw', e);
        setPlatformSupported(false);
      }
    })();
  }, []);

  useEffect(() => {
    // usernameless conditional UI 嘗試：僅在已檢測到支援且尚未登入時觸發一次
    if (platformSupported === null) return;
    // 初始是否已登入檢查與平台支援檢測已在第一個 useEffect 完成
    if (platformSupported === null) return;
    (async () => {
      try {
        if (conditionalTried) return;
        if (!platformSupported) return;
        if (!(window as any).PublicKeyCredential) return;
        if (localStorage.getItem('isLogin') === '1') return;
        setConditionalTried(true);
        const resp = await fetch('/api/auth/webauthn/login/challenge', {
          method: 'POST',
          credentials: 'include',
        });
        const json = await resp.json();
        if (!json.success) return; // 若後端回 404/錯誤直接跳過
        const pubKey = json.publicKey;
        pubKey.challenge = base64urlToBuffer(pubKey.challenge);
        if (pubKey.allowCredentials && pubKey.allowCredentials.length) {
          pubKey.allowCredentials = pubKey.allowCredentials.map((c: any) => ({
            ...c,
            id: base64urlToBuffer(c.id),
          }));
        }
        const assertion: any = await navigator.credentials.get({
          publicKey: pubKey,
        });
        if (!assertion) return;
        const payload = credentialToJSON(assertion);
        const verifyRes = await fetch('/api/auth/webauthn/login/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        const verifyJson = await verifyRes.json();
        if (verifyJson.success) {
          try {
            const meRes = await fetch('/api/auth/me', {
              credentials: 'include',
            });
            const meJson = await meRes.json();
            if (meJson.success) {
              finalizeLogin(meJson.data);
              message.success('Passkey 登入成功');
              return;
            }
          } catch {}
          finalizeLogin({});
          message.success('Passkey 登入成功');
        } else {
          if (process.env.NEXT_PUBLIC_WEBAUTHN_DEBUG === '1') {
            console.log('[WebAuthn][conditional] verify failed', verifyJson);
          }
          message.error(
            'Passkey 驗證失敗: ' + (verifyJson.error || verifyJson.code || '')
          );
        }
      } catch (e) {
        if (process.env.NEXT_PUBLIC_WEBAUTHN_DEBUG === '1')
          console.log('[WebAuthn][conditional] error', e);
      }
    })();
  }, [platformSupported]);

  function mapWebAuthnError(e: any): string {
    if (!e) return '未知錯誤';
    if (typeof e === 'object' && e.code) {
      switch (e.code) {
        case 'SERVER_MISCONFIG':
          return '伺服器 RP/ORIGIN 未設定';
        case 'CHALLENGE_MISSING':
          return '挑戰遺失或逾時';
        case 'CREDENTIAL_NOT_FOUND':
          return '憑證不存在';
        case 'USER_MISMATCH':
          return '使用者不匹配';
        case 'REPLAY_DETECTED':
          return '偵測到重放攻擊';
        case 'VERIFY_FAILED':
          return '後端驗證失敗';
      }
    }
    if (!e.name) return '未知錯誤';
    switch (e.name) {
      case 'NotAllowedError':
        return '操作被取消或逾時 (NotAllowed)';
      case 'InvalidStateError':
        return '此憑證已被註冊 (InvalidState)';
      case 'SecurityError':
        return '安全條件不成立 (SecurityError)';
      case 'ConstraintError':
        return '裝置限制無法建立 (ConstraintError)';
      case 'UnknownError':
        return '未知平台錯誤 (UnknownError)';
      case 'AbortError':
        return '操作被中止 (Abort)';
      default:
        return `${e.name}`;
    }
  }

  async function beginRegisterPasskey() {
    try {
      const employeeId =
        pendingUser?.employeeId || form.getFieldValue('employeeId');
      if (!employeeId) {
        message.warning('請先輸入工號並以帳密登入');
        return;
      }
      const res = await fetch('/api/auth/webauthn/register/challenge', {
        method: 'POST',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) {
        message.error(json.error || '產生註冊挑戰失敗');
        return;
      }
      const pubKey = json.publicKey;
      pubKey.challenge = base64urlToBuffer(pubKey.challenge);
      pubKey.user.id = base64urlToBuffer(pubKey.user.id);
      const cred: any = await navigator.credentials.create({
        publicKey: pubKey,
      });
      if (!cred) {
        message.error('建立生物辨識憑證失敗');
        return;
      }
      const payload = credentialToJSON(cred);
      const verifyRes = await fetch('/api/auth/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const verifyJson = await verifyRes.json();
      if (verifyJson.success) {
        message.success('已啟用生物辨識');
        finalizeLogin(pendingUser || { employeeId });
      } else {
        message.error(verifyJson.error || '啟用失敗');
      }
    } catch (e: any) {
      console.error(e);
      message.error('啟用生物辨識流程錯誤: ' + mapWebAuthnError(e));
    }
  }

  async function beginLoginPasskeyUsernameless() {
    try {
      if (localStorage.getItem('isLogin') === '1') return; // 已登入不再觸發
      const resp = await fetch('/api/auth/webauthn/login/challenge', {
        method: 'POST',
        credentials: 'include',
      });
      const json = await resp.json();
      if (!json.success) {
        if (process.env.NEXT_PUBLIC_WEBAUTHN_DEBUG === '1') {
          console.log('[WebAuthn][manual-usernameless] challenge failed', json);
        }
        message.error(json.error || '取得挑戰失敗');
        return;
      }
      const pubKey = json.publicKey;
      pubKey.challenge = base64urlToBuffer(pubKey.challenge);
      const assertion: any = await navigator.credentials.get({
        publicKey: pubKey,
      });
      if (!assertion) {
        message.error('未取得平台憑證');
        return;
      }
      const payload = credentialToJSON(assertion);
      const verifyRes = await fetch('/api/auth/webauthn/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const verifyJson = await verifyRes.json();
      if (verifyJson.success) {
        try {
          const meRes = await fetch('/api/auth/me', { credentials: 'include' });
          const meJson = await meRes.json();
          if (meJson.success) {
            finalizeLogin(meJson.data);
            message.success('Face ID 登入成功');
            return;
          }
        } catch {}
        finalizeLogin({});
        message.success('Face ID 登入成功');
      } else {
        message.error(verifyJson.error || 'Face ID 驗證失敗');
      }
    } catch (e) {
      if (process.env.NEXT_PUBLIC_WEBAUTHN_DEBUG === '1') {
        console.log('[WebAuthn][manual-usernameless] error', e);
      }
      message.error('Face ID 流程錯誤');
    }
  }

  async function beginLoginPasskey(employeeId?: string) {
    try {
      const id = employeeId || form.getFieldValue('employeeId');
      if (!id) {
        message.warning('請先輸入工號');
        return;
      }
      const res = await fetch('/api/auth/webauthn/login/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ employeeId: id }),
      });
      const json = await res.json();
      if (!json.success) {
        if (res.status === 404) {
          message.warning('尚未啟用生物辨識，請先以帳密登入啟用');
        } else {
          message.error(json.error || '產生登入挑戰失敗');
        }
        return;
      }
      const pubKey = json.publicKey;
      pubKey.challenge = base64urlToBuffer(pubKey.challenge);
      if (pubKey.allowCredentials && pubKey.allowCredentials.length) {
        pubKey.allowCredentials = pubKey.allowCredentials.map((c: any) => ({
          ...c,
          id: base64urlToBuffer(c.id),
        }));
      }
      const assertion: any = await navigator.credentials.get({
        publicKey: pubKey,
      });
      if (!assertion) {
        message.error('取得憑證失敗');
        return;
      }
      const payload = credentialToJSON(assertion);
      const verifyRes = await fetch('/api/auth/webauthn/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const verifyJson = await verifyRes.json();
      if (verifyJson.success) {
        try {
          const meRes = await fetch('/api/auth/me', { credentials: 'include' });
          const meJson = await meRes.json();
          if (meJson.success) {
            finalizeLogin(meJson.data);
            message.success('生物驗證登入成功');
            return;
          }
        } catch {}
        finalizeLogin({ employeeId: id });
        message.success('生物驗證登入成功');
      } else {
        message.error(verifyJson.error || '登入驗證失敗');
      }
    } catch (e: any) {
      console.error(e);
      message.error('生物驗證登入流程錯誤: ' + mapWebAuthnError(e));
    }
  }

  function credentialToJSON(obj: any): any {
    if (!obj) return obj;
    if (
      typeof obj === 'object' &&
      'id' in obj &&
      'rawId' in obj &&
      'response' in obj
    ) {
      const cred: any = obj;
      const resp: any = cred.response || {};
      const out: any = {
        id: cred.id,
        type: cred.type,
        rawId: bufferToBase64url(cred.rawId),
        response: {},
        clientExtensionResults:
          typeof cred.getClientExtensionResults === 'function'
            ? cred.getClientExtensionResults()
            : {},
      };
      if (resp.clientDataJSON)
        out.response.clientDataJSON = bufferToBase64url(resp.clientDataJSON);
      if (resp.attestationObject)
        out.response.attestationObject = bufferToBase64url(
          resp.attestationObject
        );
      if (resp.authenticatorData)
        out.response.authenticatorData = bufferToBase64url(
          resp.authenticatorData
        );
      if (resp.signature)
        out.response.signature = bufferToBase64url(resp.signature);
      if (resp.userHandle)
        out.response.userHandle = bufferToBase64url(resp.userHandle);
      return out;
    }
    if (obj instanceof ArrayBuffer) return bufferToBase64url(obj);
    if (Array.isArray(obj)) return obj.map(credentialToJSON);
    if (typeof obj === 'object') {
      const r: any = {};
      for (const k in obj) r[k] = credentialToJSON((obj as any)[k]);
      return r;
    }
    return obj;
  }

  function bufferToBase64url(buf: ArrayBuffer) {
    return toBase64URL(buf as any);
  }
  function base64urlToBuffer(b64url: string) {
    return new Uint8Array(fromBase64URL(b64url));
  }

  function finalizeLogin(userData: any) {
    localStorage.setItem('isLogin', '1');
    if (pendingUser) {
      localStorage.setItem('user', JSON.stringify(pendingUser));
    } else if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    window.location.href = '/';
  }

  const handleLogin = async (values: {
    employeeId: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        if (result.data?.requiresWebAuthn) {
          setRequiresWebAuthn(true);
          setPendingUser(result.data.user);
          message.info('需要第二階段生物驗證');
        } else {
          message.success('登入成功');
          finalizeLogin(result.data.user);
        }
      } else {
        message.error(result.error || '登入失敗');
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      message.error('登入失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `url('/bg.jpg') center 80px / 1900px no-repeat, linear-gradient(135deg, #f0f4ff 0%, #e6f7ff 50%)`,
        backgroundAttachment: 'fixed',
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 16,
          boxShadow: '0 4px 32px #0001',
          padding: 0,
        }}
        bodyStyle={{ padding: 32 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Image
            src="/next.svg"
            alt="logo"
            width={48}
            height={48}
            style={{ marginBottom: 8 }}
          />
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            專案追蹤系統
          </Typography.Title>
          <Typography.Text type="secondary">請登入您的帳號</Typography.Text>
        </div>
        <Form form={form} onFinish={handleLogin} layout="vertical" size="large">
          <Form.Item
            name="employeeId"
            rules={[{ required: true, message: '請輸入工號' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#1677ff' }} />}
              placeholder="工號"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '請輸入密碼' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1677ff' }} />}
              placeholder="密碼"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item
            name="remember"
            valuePropName="checked"
            style={{ marginBottom: 8 }}
          >
            <Checkbox>記住我</Checkbox>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<LoginOutlined />}
              style={{ fontWeight: 600, letterSpacing: 2 }}
            >
              登入
            </Button>
          </Form.Item>
        </Form>
        {platformSupported === false && (
          <Typography.Text
            type="danger"
            style={{ display: 'block', marginTop: 8 }}
          >
            未偵測到可用的平台生物辨識 (可能原因: 未設定螢幕鎖/Face
            ID/指紋、瀏覽器版本過舊、或非 HTTPS)。
          </Typography.Text>
        )}
        <Divider style={{ margin: '20px 0 12px' }}>或</Divider>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            onClick={() => beginLoginPasskey()}
            block
            icon={<SafetyCertificateOutlined />}
            disabled={platformSupported === false}
          >
            使用生物辨識登入
          </Button>
        </Space>
        {requiresWebAuthn && (
          <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
            <Button
              type="primary"
              onClick={() => beginLoginPasskeyUsernameless()}
              block
              disabled={platformSupported === false}
            >
              Face ID 快速完成 (無需輸入工號)
            </Button>
            <Button
              onClick={() => beginLoginPasskey(pendingUser?.employeeId)}
              block
              disabled={platformSupported === false}
            >
              備援：指定工號驗證
            </Button>
            <Button
              onClick={() => beginRegisterPasskey()}
              block
              disabled={platformSupported === false}
            >
              重建/啟用生物辨識 (建立新憑證)
            </Button>
          </Space>
        )}
        {!requiresWebAuthn && pendingUser && (
          <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
            <Button
              onClick={() => beginRegisterPasskey()}
              block
              disabled={platformSupported === false}
            >
              啟用生物辨識 (建立憑證)
            </Button>
          </Space>
        )}
        <div
          style={{
            textAlign: 'center',
            marginTop: 24,
            color: '#888',
            fontSize: 13,
          }}
        >
          <span>© {new Date().getFullYear()} Project Tracking System</span>
        </div>
      </Card>
    </div>
  );
}

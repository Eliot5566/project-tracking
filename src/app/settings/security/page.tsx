'use client';
import { useEffect, useState } from 'react';
import { Card, Button, Typography, Space, message, Divider, Alert } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

function bufferToBase64url(buf: ArrayBuffer) {
  const b = Buffer.from(buf as any);
  return b
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
function base64urlToBuffer(b64url: string) {
  b64url = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64url.length % 4;
  if (pad) b64url += '='.repeat(4 - pad);
  return Uint8Array.from(Buffer.from(b64url, 'base64'));
}

export default function SecuritySettingsPage() {
  const [loading, setLoading] = useState(false);
  const [hasPasskey, setHasPasskey] = useState<boolean | null>(null);
  const [platformSupported, setPlatformSupported] = useState<boolean | null>(
    null
  );
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/auth/me');
        const j = await r.json();
        if (j.success) {
          setUser(j.data);
          setHasPasskey(j.data.hasPasskey);
        }
      } catch {}
    })();
    (async () => {
      if (typeof window === 'undefined') return;
      if (!window.isSecureContext) {
        setPlatformSupported(false);
        return;
      }
      const PKC: any = (window as any).PublicKeyCredential;
      if (
        !PKC ||
        typeof PKC.isUserVerifyingPlatformAuthenticatorAvailable !== 'function'
      ) {
        setPlatformSupported(false);
        return;
      }
      try {
        setPlatformSupported(
          await PKC.isUserVerifyingPlatformAuthenticatorAvailable()
        );
      } catch {
        setPlatformSupported(false);
      }
    })();
  }, []);

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

  async function enablePasskey() {
    setLoading(true);
    try {
      const challengeRes = await fetch(
        '/api/auth/webauthn/register/challenge',
        { method: 'POST' }
      );
      const challengeJson = await challengeRes.json();
      if (!challengeJson.success) {
        message.error(challengeJson.error || '產生註冊挑戰失敗');
        return;
      }
      const pubKey = challengeJson.publicKey;
      pubKey.challenge = base64urlToBuffer(pubKey.challenge);
      pubKey.user.id = base64urlToBuffer(pubKey.user.id);
      const cred: any = await navigator.credentials.create({
        publicKey: pubKey,
      });
      if (!cred) {
        message.error('建立憑證失敗');
        return;
      }
      const payload = credentialToJSON(cred);
      const verifyRes = await fetch('/api/auth/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const verifyJson = await verifyRes.json();
      if (verifyJson.success) {
        message.success('已啟用生物辨識');
        setHasPasskey(true);
      } else {
        message.error(verifyJson.error || '啟用失敗');
      }
    } catch (e: any) {
      message.error('啟用流程錯誤: ' + (e?.name || e?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  async function testLoginAssertion() {
    try {
      const id = user?.employeeId;
      if (!id) {
        message.warning('無 employeeId');
        return;
      }
      const res = await fetch('/api/auth/webauthn/login/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: id }),
      });
      const json = await res.json();
      if (!json.success) {
        message.error(json.error || '產生登入挑戰失敗');
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
        body: JSON.stringify(payload),
      });
      const verifyJson = await verifyRes.json();
      if (verifyJson.success) {
        message.success('測試登入成功');
      } else {
        message.error(verifyJson.error || '登入驗證失敗');
      }
    } catch (e: any) {
      message.error('測試登入錯誤: ' + (e?.name || e?.message || ''));
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    try {
      localStorage.removeItem('isLogin');
      localStorage.removeItem('user');
    } catch {}
    window.location.href = '/login';
  }

  return (
    <div style={{ maxWidth: 640, margin: '32px auto', padding: '0 16px' }}>
      <Typography.Title level={3}>安全設定</Typography.Title>
      <Card style={{ marginBottom: 24 }} title="生物辨識登入 (WebAuthn)">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {platformSupported === false && (
            <Alert
              type="warning"
              showIcon
              message="此裝置不支援平台生物辨識 (可能未設定螢幕鎖 / Face ID / 指紋或非 HTTPS)。"
            />
          )}
          {platformSupported && hasPasskey === false && (
            <Alert
              type="info"
              showIcon
              message="尚未啟用，建議立即啟用以加速日後登入。"
            />
          )}
          {platformSupported && hasPasskey && (
            <Alert
              type="success"
              showIcon
              message="已啟用，可使用工號 + 生物辨識快速登入。"
            />
          )}
          <div>
            <Typography.Text>
              目前狀態：
              {platformSupported === null
                ? '檢測中...'
                : platformSupported
                ? hasPasskey
                  ? '已啟用'
                  : '可啟用'
                : '不支援'}
            </Typography.Text>
          </div>
          <Divider style={{ margin: '8px 0' }} />
          <Space>
            <Button
              type="primary"
              icon={<SafetyCertificateOutlined />}
              disabled={!platformSupported || hasPasskey || loading}
              loading={loading}
              onClick={enablePasskey}
            >
              啟用生物辨識
            </Button>
            <Button
              disabled={!platformSupported || !hasPasskey}
              onClick={testLoginAssertion}
            >
              測試快速登入
            </Button>
            <Button danger onClick={logout}>
              登出
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}

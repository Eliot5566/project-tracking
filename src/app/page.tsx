"use client";


import { Row, Col, Card, Typography, Button } from 'antd';
import { ProjectOutlined, LineChartOutlined, TeamOutlined, FileOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const { Title, Text } = Typography;

const features = [
  {
    title: '任務管理',
    description: '輕鬆追蹤和管理專案中的各項任務，提高工作效率。',
    icon: <ProjectOutlined style={{ fontSize: 40 }} />, 
    path: '/task'
  },
  {
    title: '進度追蹤',
    description: '即時查看專案進度，確保按時完成目標。',
    icon: <LineChartOutlined style={{ fontSize: 40 }} />, 
    path: '/progress'
  },
  // {
  //   title: '團隊管理',
  //   description: '管理團隊成員資料。',
  //   icon: <TeamOutlined style={{ fontSize: 40 }} />, 
  //   path: '/team'
  // },
  {
    title: '文件管理',
    description: '上傳和管理專案文件，追蹤歷史版本。',
    icon: <FileOutlined style={{ fontSize: 40 }} />, 
    path: '/documents'
  },
];

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLogin = localStorage.getItem('isLogin') === '1';
      if (!isLogin) {
        router.replace('/login');
      }
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: `url('/bg.jpg') center 80px / 1900px no-repeat, linear-gradient(135deg, #f0f4ff 0%, #e6f7ff 50%)`,
        backgroundAttachment: 'fixed', //backgroundAttachment用來設定背景圖片的固定 設為fixed可以使背景圖片隨著視窗滾動而固定
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0',
      }}
    >
      <div
        style={{
          maxWidth: 1900,
          width: '100%',
          margin: '0 auto',
          padding: '4rem 1rem 2rem 1rem',
          zIndex: 1,
        }}
      >
        <Title
          level={2}
          style={{
            textAlign: 'center',
            marginBottom: '2.5rem',
            fontWeight: 800,
            color: '#222',
            letterSpacing: 2,
            textShadow: '0 2px 16px #b3d1ff44',
          }}
        >
          歡迎使用專案追蹤系統
        </Title>

        <Row gutter={[32, 32]} justify="center" align="middle">
          {features.map((feature) => (
            <Col xs={24} sm={12} md={8} key={feature.title}>
              <Card
                hoverable
                style={{
                  // display : 'flex',
                  // flexDirection: 'column',
                  // alignItems: 'center',
                  // justifyContent: 'center',
                  height: '100%',
                  borderRadius: 15,
                  boxShadow: '0 4px 32px #b3d1ff22',
                  background: 'rgba(255,255,255,0.95)',
                  border: '1px solid #e6f0ff',
                  transition: 'box-shadow 0.2s',
                }}
                bodyStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%',
                  padding: '2.5rem 1.5rem 2rem 1.5rem',
                }}
              >
                <div
                  style={{
                    color: '#1890ff',
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                    borderRadius: '50%',
                    width: 64,
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px #b3d1ff33',
                    // transform: 'scale(1)',
                  
                  }}
                >
                  {feature.icon}
                </div>
                <Title level={4} style={{ marginBottom: '1rem', fontWeight: 700, color: '#222' }}>
                  {feature.title}
                </Title>
                <Text type="secondary" style={{ marginBottom: '2rem', fontSize: 16, color: '#555' }}>
                  {feature.description}
                </Text>
                <Button
                  type="primary"
                  onClick={() => router.push(feature.path)}
                  style={{
                    marginTop: 'auto',
                    borderRadius: 24,
                    fontWeight: 600,
                    fontSize: 16,
                    padding: '0 2.5em',
                    boxShadow: '0 2px 8px #b3d1ff33',
                  }}
                  size="large"
                >
                  開始使用
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}

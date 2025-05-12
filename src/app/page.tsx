"use client";

import { Row, Col, Card, Typography, Button } from 'antd';
import { ProjectOutlined, LineChartOutlined, TeamOutlined, FileOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

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
  {
    title: '團隊管理',
    description: '管理團隊成員資料。',
    icon: <TeamOutlined style={{ fontSize: 40 }} />,
    path: '/team'
  },
  // {
  //   title: '文件管理',
  //   description: '上傳和管理專案文件，追蹤歷史版本。',
  //   icon: <FileOutlined style={{ fontSize: 40 }} />,
  //   path: '/documents'
  // },
];

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '3rem' }}>
        歡迎使用專案追蹤系統
      </Title>
      
      <Row gutter={[24, 24]}>
        {features.map((feature) => (
          <Col xs={24} md={8} key={feature.title}>
            <Card
              hoverable
              style={{ height: '100%' }}
              bodyStyle={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%'
              }}
            >
              <div style={{ color: '#1890ff', marginBottom: '1rem' }}>
                {feature.icon}
              </div>
              <Title level={4} style={{ marginBottom: '1rem' }}>
                {feature.title}
              </Title>
              <Text type="secondary" style={{ marginBottom: '1.5rem' }}>
                {feature.description}
              </Text>
              <Button 
                type="primary" 
                onClick={() => router.push(feature.path)}
                style={{ marginTop: 'auto' }}
              >
                開始使用
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

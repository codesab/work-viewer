import {
  BarsOutlined,
  CalendarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Row, Col, Typography, Space, Segmented, Button } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const { Title } = Typography;

const IssuesHeader = ({
  selectedView,
  onViewChange,
}: {
  selectedView: "list" | "calendar";
  onViewChange: (val: "list" | "calendar") => void;
}) => {
  const navigate = useNavigate();

  return (
    <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
      <Col>
        <Title level={3} style={{ margin: 0 }}>
          Product & Engineering Releases
        </Title>
      </Col>
      <Col>
        <Space>
          <Segmented
            options={[
              { label: "List View", value: "list", icon: <BarsOutlined /> },
              {
                label: "Calendar View",
                value: "calendar",
                icon: <CalendarOutlined />,
              },
            ]}
            value={selectedView}
            onChange={(val) => {
              navigate(`/issues/${val}`);
              onViewChange(val as "list" | "calendar");
            }}
          />
          <Button type="primary" icon={<PlusOutlined />}>
            Report New
          </Button>
        </Space>
      </Col>
    </Row>
  );
};

export default IssuesHeader;

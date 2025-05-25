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
              { label: "List View", value: "list" },
              { label: "Calendar View", value: "calendar" },
            ]}
            value={selectedView}
            onChange={(val) => {
              navigate(`/issues/${val}`);
              onViewChange(val as "list" | "calendar");
            }}
          />
          <Button type="primary" onClick={() => window.open("https://your-form-url.com", "_blank")}>
            Report Bug / Feature
          </Button>
        </Space>
      </Col>
    </Row>
  );
};

export default IssuesHeader;

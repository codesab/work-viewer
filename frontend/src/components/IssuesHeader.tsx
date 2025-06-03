import {
  BarsOutlined,
  CalendarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Row, Col, Typography, Space, Segmented, Button, Tooltip } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateIssueModal from "./CreateIssueModal";

const { Title } = Typography;

interface IssuesHeaderProps {
  selectedView: "list" | "calendar";
  onViewChange: (val: "list" | "calendar") => void;
  setSelectedIssue: (issueKey: string) => void;
}

const IssuesHeader = ({
  selectedView,
  onViewChange,
  setSelectedIssue
}: IssuesHeaderProps) => {
  const navigate = useNavigate();
  const [openCreateModal, setOpenCreateModal] = useState(false);

  return (
    <>
    
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
              navigate(`/app/releases/${val}`);
              onViewChange(val as "list" | "calendar");
            }}
          />
          <Tooltip title="Coming soon!">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenCreateModal(true)}>
              Report New
            </Button>
          </Tooltip>
        </Space>
      </Col>
    </Row>
    <CreateIssueModal
        visible={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false); 
        }}
        projectKey={"PHNX"}
        setSelectedIssue={setSelectedIssue}
      />
    </>
  );
};

export default IssuesHeader;

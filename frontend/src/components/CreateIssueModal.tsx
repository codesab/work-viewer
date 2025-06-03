import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  message,
  Segmented,
  Typography,
  Space,
  List,
} from "antd";
import axios from "axios";
import { getIcon } from "../utils";
import { SearchOutlined, EyeOutlined, LikeOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

interface CreateIssueModalProps {
  visible: boolean;
  onClose: () => void;
  projectKey: string;
  onSuccess?: () => void;
}

const issueTypes = [
  { label: "Feature Request", value: "feature", icon: getIcon("story") },
  { label: "Bug", value: "bug", icon: getIcon("bug") },
];

const priorities = ["Highest", "High", "Medium", "Low", "Lowest"];

const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  visible,
  onClose,
  projectKey,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [matchedIssues, setMatchedIssues] = useState<any[]>([]);
  const [summaryQuery, setSummaryQuery] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (summaryQuery.length >= 3) {
        // Call match API
        axios
          .get(`${process.env.REACT_APP_JIRA_SERVICE_URL}/api/search-issues`, {
            params: { q: summaryQuery },
          })
          .then((res) => setMatchedIssues(res.data || []))
          .catch(() => setMatchedIssues([]));
      } else {
        setMatchedIssues([]);
      }
    }, 500); // debounce

    return () => clearTimeout(timeout);
  }, [summaryQuery]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_JIRA_SERVICE_URL}/api/create-ticket/${projectKey}`,
        values
      );
      message.success("Issue created successfully");
      form.resetFields();
      setMatchedIssues([]);
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLoading(false);
      if (err?.response?.data?.detail) {
        message.error(err.response.data.detail);
      } else {
        message.error("Failed to create issue");
      }
    }
  };

  const handleBack = async (issueKey: string) => {
    await axios.post(
      `${process.env.REACT_APP_JIRA_SERVICE_URL}/api/back-issue/${issueKey}`
    );
    message.success("You've backed the issue");
    onClose();
  };

  return (
    <Modal
      title="Create Issue"
      open={visible}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Create"
      destroyOnClose
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        labelAlign="left"
        colon={false}
        layout="horizontal"
      >
        <Form.Item
          name="issue_type"
          label="Type"
          initialValue="bug"
          rules={[{ required: true, message: "Please select issue type" }]}
        >
          <Segmented options={issueTypes} />
        </Form.Item>

        <Form.Item
          name="summary"
          label="Summary"
          rules={[{ required: true, message: "Please enter summary" }]}
        >
          <Input
            onChange={(e) => {
              setSummaryQuery(e.target.value);
            }}
            prefix={<SearchOutlined />}
          />
        </Form.Item>

        {matchedIssues.length > 0 && (
          <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
            <Text type="secondary">Possible matches:</Text>
            <List
              size="small"
              dataSource={matchedIssues}
              style={{ marginTop: 8 }}
              renderItem={(item: any) => (
                <List.Item
                  actions={[
                    <Button
                      size="small"
                      icon={<LikeOutlined />}
                      onClick={() => handleBack(item.key)}
                    >
                      Back
                    </Button>,
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() =>
                        window.open(`/browse/${item.key}`, "_blank")
                      }
                    >
                      View
                    </Button>,
                  ]}
                >
                  <Text>{item.summary}</Text>
                </List.Item>
              )}
            />
          </Form.Item>
        )}

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          initialValue="Medium"
          rules={[{ required: true, message: "Please select priority" }]}
        >
          <Select>
            {priorities.map((priority) => (
              <Option value={priority} key={priority}>
                {priority}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateIssueModal;
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
  Spin,
} from "antd";
import axios from "axios";
import { getIcon } from "../utils";
import { SearchOutlined, EyeOutlined, LikeOutlined, LoadingOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

interface CreateIssueModalProps {
  visible: boolean;
  onClose: () => void;
  projectKey: string;
  onSuccess?: () => void;
  setSelectedIssue: (issueKey: string) => void;
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
  setSelectedIssue,
}) => {
  const [loading, setLoading] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [backerLoading, setBackerLoading] = useState(false);
  const [form] = Form.useForm();
  const [matchedIssues, setMatchedIssues] = useState<any[]>([]);
  const [summaryQuery, setSummaryQuery] = useState("");

  useEffect(() => {
    setQueryLoading(true);
    const timeout = setTimeout(() => {
      if (summaryQuery.length >= 3) {
        axios
          .get(
            `${process.env.REACT_APP_JIRA_SERVICE_URL}/api/issues/${projectKey}`,
            {
              params: {
                page: 1,
                size: 5,
                sort_by: "key",
                sort_order: "desc",
                search: summaryQuery,
              },
            }
          )
          .then((res) => setMatchedIssues(res.data.items || []))
          .catch(() => setMatchedIssues([]))
          .finally(() => setQueryLoading(false))
      } else {
        setQueryLoading(false);
        setMatchedIssues([]);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [summaryQuery, projectKey]);

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
    setBackerLoading(true);
    await axios.post(
      `${process.env.REACT_APP_JIRA_SERVICE_URL}/api/issue/${issueKey}/add-backers`,
      {
        backers: [localStorage.getItem("email")],
      }
    );
    message.success("You've backed the issue");
    setBackerLoading(false);
    onClose();
  };

  const handleViewIssue = (issueKey: string) => {
    setSelectedIssue(issueKey); // Set the selected issue
    onClose(); // Close the modal
  };

  return (
    <Modal
      title="Create Issue"
      open={visible}
      onCancel={() => {
        form.resetFields(); // Reset form fields
        setMatchedIssues([]); // Clear matched issues
        onClose(); // Call the original onClose handler
      }}
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
            prefix={queryLoading ? <Spin indicator={<LoadingOutlined size={4}/>}/> : <SearchOutlined />}
          />
        </Form.Item>

        {queryLoading && <Text type={'secondary'}>Searching for matching issues.. </Text>}

        {matchedIssues.length > 0 && (
          <Form.Item wrapperCol={{ span: 24 }}>
            <Text type="secondary">Possible matches:</Text>
            <List
              size="small"
              dataSource={matchedIssues}
              renderItem={(item: any) => (
                <List.Item
                  actions={[
                    <Button
                      size="small"
                      icon={backerLoading ? <Spin indicator={<LoadingOutlined size={4} />}/> : <LikeOutlined />}
                      onClick={() => handleBack(item.key)}
                    >
                      Back
                    </Button>,
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewIssue}
                    >
                      View
                    </Button>,
                  ]}
                >
                  <Text>{item.title}</Text>
                </List.Item>
              )}
            />
          </Form.Item>
        )}

        {matchedIssues.length === 0 && (
          <>
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
          </>
        )}
      </Form>
    </Modal>
  );
};

export default CreateIssueModal;

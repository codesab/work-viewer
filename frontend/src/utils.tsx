import {
  BugOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  CheckOutlined,
} from "@ant-design/icons";

export const getInitials = (name: string): string => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const last = parts[1]?.[0] || parts[0]?.[1] || "";
  return (first + last).toUpperCase();
};

export const getAvatarColor = (name: string): string => {
  const colors = [
    "#f56a00",
    "#7265e6",
    "#ffbf00",
    "#00a2ae",
    "#1890ff",
    "#52c41a",
    "#faad14",
    "#eb2f96",
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "done":
      return "green";
    case "in progress":
      return "blue";
    case "to do":
      return "gray";
    default:
      return "default";
  }
};

export const getTagColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "story":
      return "green";
    case "bug":
      return "red";
    case "task":
      return "blue";
    default:
      return "default";
  }
};

export const getIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "bug":
      return <BugOutlined color={"red"} />;
    case "story":
      return <FileTextOutlined color={"green"} />;
    case "epic":
      return <ThunderboltOutlined color={"purple"} />;
    case "sub-task":
      return <CheckOutlined color={"green"} />;
    default:
      return <FileTextOutlined />;
  }
};

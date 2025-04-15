
import React, { useEffect, useState } from 'react';
import { Card, Typography, Alert } from 'antd';

const { Title } = Typography;

const Issues: React.FC = () => {
  const [validationResult, setValidationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const projectKey = "PH";

  useEffect(() => {
    const validateProject = async () => {
      try {
        const response = await fetch(`http://0.0.0.0:5000/api/validate-project/${projectKey}`);
        const data = await response.json();
        setValidationResult(data);
        setError(null);
      } catch (err) {
        setError("Failed to validate project");
        setValidationResult(null);
      }
    };

    validateProject();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Project Validation</Title>
      <Card title={`Validating Project: ${projectKey}`}>
        {error && <Alert type="error" message={error} />}
        {validationResult && (
          <pre>{JSON.stringify(validationResult, null, 2)}</pre>
        )}
      </Card>
    </div>
  );
};

export default Issues;


import React, { useEffect, useState } from 'react';
import { Card, Typography, Alert } from 'antd';

const { Title } = Typography;

const Issues: React.FC = () => {
  const [validationResult, setValidationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const projectKey = "PH";

  useEffect(() => {
    const validateAuth = async () => {
      try {
        const response = await fetch('http://0.0.0.0:5000/api/validate-auth');
        const data = await response.json();
        
        if (data.authenticated) {
          // After successful authentication, validate project
          const projectResponse = await fetch(`http://0.0.0.0:5000/api/validate-project/${projectKey}`);
          const projectData = await projectResponse.json();
          setValidationResult(projectData);
          setError(null);
        }
      } catch (err: any) {
        setError(err.message || "Authentication failed");
        setValidationResult(null);
      }
    };

    validateAuth();
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

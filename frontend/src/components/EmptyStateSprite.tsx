// src/components/EmptyStateSprite.tsx
import React, { useEffect, useState } from "react";
import { Typography, Spin } from "antd";
import "./EmptyStateSprite.css";

const { Text } = Typography;

const SPRITE_POSITIONS = [
  { x: 0, y: 0 },
  { x: -256, y: 0 },
  { x: 0, y: -256 },
  { x: -256, y: -256 },
];

const EmptyStateSprite: React.FC = () => {
  const [quote, setQuote] = useState<string | null>(null);
  const [spriteIndex, setSpriteIndex] = useState<number>(
    Math.floor(Math.random() * 4)
  );

  useEffect(() => {
    fetch("https://api.quotable.io/random?tags=wisdom|funny|technology")
      .then((res) => res.json())
      .then((data) => {
        setQuote(data.content);
      })
      .catch(() => {
        setQuote("Even the void has something to say.");
      });
  }, []);

  const { x, y } = SPRITE_POSITIONS[spriteIndex];

  return (
    <div className="empty-state-container">
      <div
        className="sprite-image"
        style={{ backgroundPosition: `${x}px ${y}px` }}
      />
      <Text type="secondary" style={{ marginTop: 16, textAlign: "center" }}>
        {quote || <Spin />}
      </Text>
    </div>
  );
};

export default EmptyStateSprite;

import { Tag } from 'antd';

const StatusTag = ({ status }) => {
  let color = 'green';
  let text = 'Sẵn sàng';
  
  if (status === 'maintenance') {
    color = 'volcano';
    text = 'Bảo trì';
  }
  
  return <Tag color={color}>{text}</Tag>;
};

export default StatusTag;
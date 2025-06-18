// UploadImages.jsx
import React from 'react';
import { Upload, Modal, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';

const UploadImages = ({ fileList, onChange, max = 5 }) => {
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState('');
  const [previewTitle, setPreviewTitle] = React.useState('');

  const handlePreview = async (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList: newFileList }) => {
    onChange(newFileList);
  };

  const beforeUpload = (file) => {
    const isImage = /image\/(jpeg|png|jpg|gif)/.test(file.type);
    if (!isImage) {
      message.error('Chỉ chấp nhận file hình ảnh!');
    }
    const isLessThan5M = file.size / 1024 / 1024 < 5;
    if (!isLessThan5M) {
      message.error('Hình ảnh phải nhỏ hơn 5MB!');
    }
    return isImage && isLessThan5M;
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh</div>
    </div>
  );

  return (
    <>
      <ImgCrop rotate aspect={4/3}>
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChange}
          beforeUpload={beforeUpload}
          customRequest={({ onSuccess }) => setTimeout(() => onSuccess('ok'), 0)}
          multiple
        >
          {fileList.length >= max ? null : uploadButton}
        </Upload>
      </ImgCrop>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
      <div style={{ marginTop: 8, color: '#888' }}>
        Tối đa {max} hình, kích thước tối đa 5MB mỗi hình
      </div>
    </>
  );
};

export default UploadImages;
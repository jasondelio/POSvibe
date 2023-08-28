import {
  Input,
  Button,
  Modal,
  Form,
  InputNumber,
  Radio,
  Upload,
  Image,
  Select,
} from "antd";
import { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

function AddProductForm({
  isModalOpen,
  setIsModalOpen,
  data,
  showNotification,
  setReloadData,
}) {
  const categoriesData = useSelector((state) => state.categories);
  const categoriesOptions = [...categoriesData]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((category) => {
      return {
        value: category.name,
        label: category.name,
      };
    });
  const [addProductForm] = Form.useForm();
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [description, setDescription] = useState("");
  const [imgUrl, setImgUrl] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [fileExt, setFileExt] = useState(null);
  const [isImgError, setIsImgError] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  function closeModal() {
    setIsModalOpen(false);
  }

  function handleSubmit() {
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/v1/product`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: name,
              category: category,
              price: price,
              isOutOfStock: isOutOfStock,
              description: description,
              imgData: { imgUrl: imgUrl, fileName: fileName, fileExt: fileExt },
            }),
          }
        );
        if (res.status === 200) {
          showNotification(
            "success",
            "Success",
            "The product is successfully added."
          );
          setReloadData((prevState) => !prevState);
        } else {
          showNotification(
            "error",
            "Error",
            "There is something wrong, please try again or contact your administrator."
          );
        }
      } catch (err) {
        showNotification(
          "error",
          "Error",
          "There is something wrong, please try again or contact your administrator."
        );
      } finally {
        closeModal();
        setLoading(false);
        handleReset();
        addProductForm.resetFields();
      }
    })();
  }

  function handleReset() {
    setName("");
    setPrice(0);
    setIsOutOfStock(false);
    setDescription("");
    setImgUrl(null);
    setFileName(null);
    setFileExt(null);
    setFileList([]);
  }

  function checkName(_, value) {
    if (!data.find((item) => item.name.toUpperCase() === value.toUpperCase())) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Product name already exists"));
  }

  function checkImageStatus() {
    if (isImgError) {
      return Promise.reject("Please upload a valid image");
    }
    return Promise.resolve();
  }

  function isImage(file) {
    const imageTypes = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    return file && imageTypes.includes(file.type);
  }

  function handleRemoveUpload() {
    setImgUrl(null);
    setFileName(null);
    setFileExt(null);
    setIsImgError(false);
    setFileList([]);
  }

  const handleImageUpload = async (file) => {
    const isLt8MB = file.size / 1024 / 1024 <= 8;
    if (!isImage(file) || !isLt8MB) {
      setFileList([
        {
          uid: file.uid,
          name: file.name,
          status: "error",
        },
      ]);
      setIsImgError(true);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileList([
          {
            uid: file.uid,
            name: file.name,
            status: "done",
          },
        ]);
        setImgUrl(reader.result);
        setFileName(file.name);
        setFileExt(file.type);
        setIsImgError(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setFileList([
        {
          uid: file.uid,
          name: file.name,
          status: "error",
        },
      ]);
      setIsImgError(true);
    }
  };

  function beforeUpload(file) {
    handleRemoveUpload();
    handleImageUpload(file);
    return false;
  }

  return (
    <Modal open={isModalOpen} footer={false} onCancel={closeModal} centered>
      <h2>Add New Product</h2>
      <Form
        form={addProductForm}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ outOfStock: false }}
        disabled={loading}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please input the name!",
            },
            {
              validator: checkName,
            },
          ]}
        >
          <Input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        </Form.Item>
        <Form.Item label="Category" name="category">
          <Select
            placeholder="Category (optional)"
            options={categoriesOptions}
            onChange={(value) => setCategory(value)}
          />
        </Form.Item>
        <Form.Item
          label="Price"
          name="price"
          rules={[
            {
              required: true,
              message: "Please input the price!",
            },
          ]}
        >
          <InputNumber
            min={0}
            step={1000}
            precision={0}
            onChange={(value) => setPrice(value)}
            placeholder="Price"
          />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input
            placeholder="Description (optional)"
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Out of Stock?" name="outOfStock" required>
          <Radio.Group onChange={(e) => setIsOutOfStock(e.target.value)}>
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="Upload Image (Max: 8MB)"
          name="uploadImage"
          rules={[
            {
              validator: checkImageStatus,
            },
          ]}
        >
          <Upload
            maxCount={1}
            accept=".jpg, .jpeg, .png, .webp"
            beforeUpload={beforeUpload}
            onRemove={handleRemoveUpload}
            fileList={fileList}
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>
        {imgUrl ? (
          <Form.Item>
            <Image width={75} height={63} src={imgUrl} />
          </Form.Item>
        ) : (
          <></>
        )}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginRight: "5px" }}
            loading={loading}
          >
            Submit
          </Button>
          <Button htmlType="reset" onClick={handleReset}>
            Reset
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AddProductForm;

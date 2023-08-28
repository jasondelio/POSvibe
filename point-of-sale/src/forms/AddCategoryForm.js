import { Input, Button, Modal, Form } from "antd";
import { useState } from "react";

function AddCategoryForm({
  isModalOpen,
  setIsModalOpen,
  data,
  showNotification,
  setReloadData,
}) {
  const [addCategoryForm] = Form.useForm();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  function closeModal() {
    setIsModalOpen(false);
  }

  function handleSubmit() {
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/v1/category`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: name,
              description: description,
            }),
          }
        );
        if (res.status === 200) {
          showNotification(
            "success",
            "Success",
            "The category is successfully added."
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
        addCategoryForm.resetFields();
      }
    })();
  }

  function handleReset() {
    setName("");
    setDescription("");
  }

  function checkName(_, value) {
    if (!data.find((item) => item.name.toUpperCase() === value.toUpperCase())) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Category name already exists"));
  }

  return (
    <Modal open={isModalOpen} footer={false} onCancel={closeModal} centered>
      <h2>Add New Category</h2>
      <Form
        form={addCategoryForm}
        layout="vertical"
        onFinish={handleSubmit}
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
        <Form.Item label="Description" name="description">
          <Input
            placeholder="Description (optional)"
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>
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

export default AddCategoryForm;

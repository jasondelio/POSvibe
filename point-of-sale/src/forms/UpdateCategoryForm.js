import { Input, Button, Modal, Form } from "antd";
import { useEffect, useState, useRef } from "react";

function UpdateCategoryForm({
  isModalOpen,
  setIsModalOpen,
  data,
  chosenName,
  showNotification,
  setReloadData,
}) {
  const [updateCategoryForm] = Form.useForm();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const chosenData = useRef("");

  useEffect(() => {
    chosenData.current = data.find((item) => item.name === chosenName);
    if (chosenData.current) {
      setName(chosenData.current.name);
      setDescription(chosenData.current.description);
      updateCategoryForm.setFieldsValue({
        name: chosenData.current.name,
        description: chosenData.current.description,
      });
    }
  }, [isModalOpen, data, chosenName, updateCategoryForm]);

  function closeModal() {
    setIsModalOpen(false);
  }

  function handleSubmit() {
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/v1/category/${chosenName}`,
          {
            method: "PUT",
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
            "The category is successfully updated."
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
      }
    })();
  }

  function checkName(_, value) {
    if (
      !data.find(
        (item) =>
          item.name.toUpperCase() === value.toUpperCase() &&
          item.name.toUpperCase() !== chosenName.toUpperCase()
      )
    ) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Category name already exists"));
  }

  function handleReset() {
    updateCategoryForm.setFieldsValue({
      name: chosenData.current.name,
      description: chosenData.current.description,
    });

    setName(chosenData.current.name);
    setDescription(chosenData.current.description);
  }

  return (
    <Modal open={isModalOpen} footer={false} onCancel={closeModal} centered>
      <h2>Update Category</h2>
      <Form
        form={updateCategoryForm}
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
          <Button onClick={handleReset}>Reset</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default UpdateCategoryForm;

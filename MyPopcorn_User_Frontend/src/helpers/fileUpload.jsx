const logoUpload = async ({
  info,
  setLogoData,
  uploadLogo,
  showAlertMessage,
  setLoader,
}) => {
  console.log("info", info);
  const {
    file,
    file: { size },
  } = info;

  if (!file) return;

  if (!file.type.startsWith("image")) {
    showAlertMessage({
      type: "error",
      message: "Only image files are allowed.",
      show: true,
    });
    return;
  }

  const maxSize = 5 * 1024 * 1024;
  if (size > maxSize) {
    showAlertMessage({
      type: "error",
      message: "File size exceeds 5MB limit.",
      show: true,
    });
    return;
  }

  try {
    setLoader(true);

    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await uploadLogo(formData);   

    if (uploadResponse.data && uploadResponse.data.success) {
      showAlertMessage({
        type: "success",
        message: uploadResponse?.data?.message,
        show: true,
      });
      setLogoData(uploadResponse?.data);
    } else {
      console.log(
        "===========erroruploadResponse=============",
        uploadResponse
      );
      throw new Error(uploadResponse.data.message || "Upload failed");
    }
  } catch (error) {
    showAlertMessage({
      type: "error",
      message: error?.response?.data?.message || error.message,
      show: true,
    });
    console.error("Error uploading file:", error);
  } finally {
    setLoader(false);
  }
};

export default logoUpload;

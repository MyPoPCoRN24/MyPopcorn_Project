export const ReedemRewards = async (
  claimTransaction,
  showAlertMessage,
  setIsModalClaim,
  setLoading,
  setResponse
) => {
  try {
    setLoading(true);
    const response = await claimTransaction();
    setResponse(response);
    if (response.data.success) {
      showAlertMessage({
        type: "success",
        message: response?.data?.message,
        show: true,
      });
    } else {
      console.error("Failed to fetch transaction balance");
    }
  } catch (error) {
    console.error("Error during dashboard API request:", error.message);
    showAlertMessage({
      type: "error",
      message: error.response.data.message,
      show: true,
    });
  } finally {
    setLoading(false);
    setIsModalClaim(false);
  }
};

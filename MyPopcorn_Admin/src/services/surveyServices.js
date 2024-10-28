import url from "../shared/constants/url";
import { Constants } from "../shared/constants/constants";

export const surveyServices = () => {
  const constants = Constants();

  const createSurvey = (val) => {
    return url.post(constants.createSurvey, val);
  };

  const editSurvey = (id, val) => {
    return url.patch(`${constants.editSurvey}/${id}`, val);
  };

  const createQuestions = (val) => {
    return url.post(constants.createQuestions, val);
  };

  const editQuestions = (val, id) => {
    return url.patch(`${constants.editQuestion}/${id}`, val);
  };

  const deleteQuestions = (id) => {
    return url.delete(`${constants.deleteQuestions}/${id}`);
  };

  const getAllQuestions = (id) => {
    return url.get(`${constants.getAllQuestions}/${id}`);
  };

  const uploadLogo = (val) => {
    return url.post(constants.uploadphoto, val);
  };

  const submitSurvey = (val) => {
    return url.post(constants.submitSurvey, val);
  };

  const submitUpdateSurvey = (val) => {
    return url.patch(constants.submitupdatsurvey, val);
  };

  const getAllSurveys = (val) => {
    return url.post(constants.getAllSurveys, val);
  };

  const changeSurveyStatus = (id, val) => {
    return url.post(`${constants.surveyStatus}/${id}`, val);
  };

  const getGraphData = (id) => {
    return url.get(`${constants.getGraphData}/${id}`);
  };

  const getSurveyAnalytics = (id) => {
    return url.get(`${constants.surveyAnalytics}/${id}`);
  };

  const getSurveyByUser = (val, id) => {
    return url.post(`${constants.getsurveybyuser}/${id}`, val);
  };

  const getSurveyQnsAnswers = (surveyId, userId) => {
    return url.get(`${constants.getsurveyanswers}/${surveyId}/${userId}`);
  };

  const swapQuestions = (val) => {
    return url.post(constants.swapQuestionsupanddown, val);
  };

  const swapSurvey = (val) => {
    return url.post(constants.swapSurveyPosition, val);
  };

  const deleteSurvey = (id) => {
    return url.delete(`${constants.deleteSurvey}/${id}`);
  };
  const editSurveyWithLinkresponse = (val) => {
    return url.post(constants.editsurveywithlink, val);
  };

  return {
    createSurvey,
    editSurvey,
    uploadLogo,
    getAllQuestions,
    createQuestions,
    deleteQuestions,
    submitSurvey,
    submitUpdateSurvey,
    editQuestions,
    getAllSurveys,
    getGraphData,
    getSurveyByUser,
    getSurveyQnsAnswers,
    getSurveyAnalytics,
    changeSurveyStatus,
    swapQuestions,
    deleteSurvey,
    swapSurvey,
    editSurveyWithLinkresponse,
  };
};

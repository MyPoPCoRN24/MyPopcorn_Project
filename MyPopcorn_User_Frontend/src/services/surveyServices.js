import url from "../shared/constants/url";
import { Constants } from "../shared/constants/constants";

export const surveyServices = () => {
  const constants = Constants();

  const createSurvey = (val) => {
    return url.post(constants.createSurvey, val);
  };

  const uploadLogo = (val) => {
    return url.post(constants.uploadphoto, val);
  };

  const getSurveyData = (id) => {
    return url.get(`${constants.getAllQuestions}/${id}`);
  };

  const getGraphData = (id) => {
    return url.get(`${constants.getGraphData}/${id}`);
  };

  const submitSurvey = (val, id) => {
    return url.post(`${constants.submitsurvey}/${id}`, val);
  };

  const getAllSurveys = (val) => {
    return url.post(constants.getAllSurvey, val);
  };

  const surveyResponse = (id) => {
    return url.get(`${constants.userSurveyResponse}/${id}`);
  };

  return {
    createSurvey,
    uploadLogo,
    getSurveyData,
    getGraphData,
    submitSurvey,
    getAllSurveys,
    surveyResponse,
  };
};

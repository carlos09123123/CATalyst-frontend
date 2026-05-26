import { previewImportedDataService, confirmImportedDataService, getImportedDataService } from "./integration.service.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export const previewIntegrationController = [
  upload.single("file"),
  async (req, res) => {
    try {
      const result = await previewImportedDataService(req.file?.buffer, req.file?.originalname, req.body.group_id);

      return res.status(result.status).json({
        success: result.status < 400,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Unable to preview imported data.",
      });
    }
  },
];

export async function confirmIntegrationController(req, res) {
  try {
    const result = await confirmImportedDataService(req.body.group_id, req.body.records);

    return res.status(result.status).json({
      success: result.status < 400,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to confirm imported data.",
    });
  }
}

export async function getIntegrationController(req, res) {
  try {
    const result = await getImportedDataService(req.params.group_id);

    return res.status(result.status).json({
      success: result.status < 400,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to fetch imported data.",
    });
  }
}

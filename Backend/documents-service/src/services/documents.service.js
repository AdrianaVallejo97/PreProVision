const { getSupabase } = require("../config/supabase");

async function uploadDocument({ file, userId }) {
  const supabase = getSupabase();

  const filePath = `${userId}/${Date.now()}_${file.originalname}`;

  const { error } = await supabase.storage
    .from("documents-service")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    error.status = 500;
    throw error;
  }

  return {
    path: filePath
  };
}
async function signedUrl(path) {
  const supabase = getSupabase();

  const { data, error } = await supabase.storage
    .from("documents-service")
    .createSignedUrl(path, 60 * 10); // 10 min

  if (error) {
    error.status = 500;
    throw error;
  }

  return data.signedUrl;
}

module.exports = { uploadDocument, signedUrl };

require("dotenv").config();
const { getSupabase } = require("../config/supabase");

(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error(error);
  } else {
    console.log("Buckets:", data);
  }

  process.exit(0);
})();

import supabase from '../../common/config/supabaseClient.js';

export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('workflows')
      .insert([{ name, description, user_id: userId }])
      .select();

    if (error) throw error;
    res.json({ data: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const joinGroupAPI = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    res.json({ message: 'Joined group', inviteCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGroupsByUserIdAPI = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ groups: { data } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateGroupAPI = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    res.json({ data: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteGroupAPI = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

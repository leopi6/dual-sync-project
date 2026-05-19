const baseURL = import.meta.env.VITE_API_BASE_URL;

// 检查响应状态的辅助函数
const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'API 请求失败');
  }
  return res.json();
};

export const api = {
  // 获取指定用户的学习计划树 (对应后端的 /api/plans/:userId)
  getPlans: (userId: 'him' | 'her') => {
    return fetch(`${baseURL}/api/plans/${userId}`).then(handleResponse);
  },

  // 提交学习打卡记录 (对应后端的 /api/checkin/plan)
  checkInPlan: (data: { userId: string; nodeId: string; completedUnits: number; note: string }) => {
    return fetch(`${baseURL}/api/checkin/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse);
  }
};
// Hàm tính toán thời gian lọc
export const getTimeFilter = (filter: string): { createdAt?: any } => {
  const now = new Date();
  switch (filter) {
    case 'today':
      return { createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } };
    case 'yesterday': {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        createdAt: {
          $gte: new Date(yesterday.setHours(0, 0, 0, 0)),
          $lt: new Date(now.setHours(0, 0, 0, 0))
        }
      };
    }
    case 'last7days':
      return { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
    case 'last30days':
      return { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
    default:
      return {}; // Không lọc, lấy tất cả
  }
};

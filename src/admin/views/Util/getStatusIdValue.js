function getStatusId(status) {
  const statusMap = {
    ACTIVE: 1,
    DORMANT: 4,
    CLOSED: 5,
  };

  return statusMap[status?.toUpperCase()] || null;
}

export default getStatusId;

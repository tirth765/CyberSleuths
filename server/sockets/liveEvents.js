module.exports = (io) => {
  const live = io.of('/live');

  live.on('connection', (socket) => {
    console.log('📡 Client connected to /live:', socket.id);

    socket.on('join-case', (caseId) => {
      socket.join(`case:${caseId}`);
      console.log(`Socket ${socket.id} joined case:${caseId}`);
    });

    socket.on('leave-case', (caseId) => {
      socket.leave(`case:${caseId}`);
    });

    socket.on('disconnect', () => {
      console.log('📡 Client disconnected:', socket.id);
    });
  });

  // Helper emitters
  live.emitNewAlert = (alert) => live.emit('new-alert', alert);
  live.emitThreatUpdate = (caseId, score) => live.to(`case:${caseId}`).emit('threat-score-update', { caseId, score });
  live.emitNewIOC = (ioc) => live.emit('new-ioc', ioc);
  live.emitCaseUpdated = (caseId, data) => live.to(`case:${caseId}`).emit('case-updated', data);
  live.emitCampaignDetected = (campaign) => live.emit('campaign-detected', campaign);

  return live;
};

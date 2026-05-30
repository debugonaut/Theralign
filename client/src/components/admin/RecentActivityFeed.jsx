import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';

const EVENT_TYPE_MAP = {
  appointment: 'BOOKING',
  registration: 'REGISTRATION',
  payment: 'PAYMENT',
  verification: 'VERIFICATION',
  review: 'REVIEW',
};

const formatTimeAgo = (dateStr) => {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch (e) {
    return 'just now';
  }
};

// First name and last initial only for privacy (e.g. "John Doe" -> "JOHN D.")
const formatActorName = (name) => {
  if (!name) return 'SYSTEM';
  const clean = name.replace(/^(Dr\.|Dr)\s+/i, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].toUpperCase();
  const first = parts[0].toUpperCase();
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${first} ${lastInitial}.`;
};

const RecentActivityFeed = ({ activity = [], loading }) => {
  if (loading) {
    return (
      <div className="bg-swiss-white border-2 border-swiss-black p-6 rounded-none shadow-none text-left space-y-4">
        <div className="pb-4 border-b border-swiss-gray-200">
          <div className="h-3 w-20 bg-swiss-gray-100 animate-pulse mb-2" />
          <div className="h-5 w-40 bg-swiss-gray-100 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-swiss-gray-150 animate-pulse rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-swiss-white border-2 border-swiss-black rounded-none shadow-none text-left">
      {/* Feed Header */}
      <div className="p-6 border-b border-swiss-gray-200">
        <span className="text-[11px] font-bold text-swiss-gray-400 uppercase tracking-widest block mb-1">
          PLATFORM AUDIT LOG
        </span>
        <h3 className="text-ui-lg font-black text-swiss-black uppercase tracking-tight">
          RECENT ACTIVITY FEED
        </h3>
      </div>

      {activity.length === 0 ? (
        <div className="p-12 text-center text-swiss-gray-400 text-ui-sm font-bold uppercase tracking-wider">
          NO SYSTEM ACTIVITIES FILED
        </div>
      ) : (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Header className="w-[120px]">Time</Table.Header>
              <Table.Header className="w-[160px]">Event Type</Table.Header>
              <Table.Header className="w-[180px]">Actor</Table.Header>
              <Table.Header>Detail</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {activity.map((item, index) => {
              const displayType = EVENT_TYPE_MAP[item.type] || item.type?.toUpperCase() || 'SYSTEM';
              const actorName = formatActorName(item.actorName || item.actor || item.user?.name);
              
              // Truncate detail sentence with full text tooltip on row hover
              const details = item.message || '';
              const truncatedDetails = details.length > 90 ? details.slice(0, 90) + '...' : details;

              return (
                <Table.Row key={index} hoverable={true}>
                  <Table.Cell className="font-mono text-swiss-gray-600 text-xs whitespace-nowrap">
                    {formatTimeAgo(item.timestamp || item.createdAt)}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant="neutral" label={displayType} size="sm" />
                  </Table.Cell>
                  <Table.Cell className="font-bold text-swiss-black uppercase tracking-wider text-xs">
                    {actorName}
                  </Table.Cell>
                  <Table.Cell className="text-swiss-gray-600 font-medium" title={details}>
                    {truncatedDetails}
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )}
    </div>
  );
};

export default RecentActivityFeed;

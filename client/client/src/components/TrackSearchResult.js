import React from 'react';
import { Card, Button } from 'react-bootstrap';

const TrackSearchResult = ({ track, chooseTrack, addToQueue }) => {
  const handlePlay = () => {
    chooseTrack(track);
  };

  return (
    <Card className="mb-2">
      <Card.Img src={track.album} alt={track.title} />
      <Card.Body>
        <Card.Title>{track.title}</Card.Title>
        <Card.Text>{track.artist}</Card.Text>
        <Button variant="primary" onClick={handlePlay}>Play</Button>
        <Button variant="secondary" onClick={addToQueue}>Add to Queue</Button>
      </Card.Body>
    </Card>
  );
};

export default TrackSearchResult;

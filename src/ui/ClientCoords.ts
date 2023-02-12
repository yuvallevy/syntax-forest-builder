type ClientX = number;
type ClientY = number;

type ClientCoords = {
  clientX: ClientX;
  clientY: ClientY;
};

export type ClientRect = {
  topLeft: ClientCoords,
  bottomRight: ClientCoords,
};

export default ClientCoords;

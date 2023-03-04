const ID_TIME_LENGTH = 6;
const ID_RANDOM_LENGTH = 4;
const ID_BASE = 36;

const maxTimestamp = parseInt('1' + '0'.repeat(ID_TIME_LENGTH), ID_BASE);
const maxRandom = parseInt('1' + '0'.repeat(ID_RANDOM_LENGTH), ID_BASE);

const padLeft = (str: string, char: string, minLength: number) =>
  str.length >= minLength ? str
    : (char.repeat(minLength - str.length) + str);

const generateNodeId = () =>
  padLeft((new Date().valueOf() % maxTimestamp).toString(ID_BASE), '0', ID_TIME_LENGTH) +
  padLeft(Math.floor(Math.random() * maxRandom).toString(ID_BASE), '0', ID_RANDOM_LENGTH);

export default generateNodeId;

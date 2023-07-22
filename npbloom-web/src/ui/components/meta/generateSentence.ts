import { pickRandom } from '../../../util/objTransforms';

// Moderately-long example words and names to make sure the click areas are large enough for untrained users
const wordChoices = [
  ['Alexis', 'Maurice', 'Nathan', 'Taylor'],
  ['likes', 'loves'],
  ['apples', 'cabbage', 'carrots', 'parsley']
];

/**
 * Returns an example sentence to build a first tree out of.
 */
const generateSentence = () => wordChoices.map(pickRandom).join(' ');

export default generateSentence;

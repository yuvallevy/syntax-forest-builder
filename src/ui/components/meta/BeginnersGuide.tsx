import { useEffect, useRef, useState } from 'react';
import { isBranching, UnpositionedPlot, UnpositionedTree } from '../../../content/unpositioned/types';
import { Alert } from '@mantine/core';
import './BeginnersGuide.scss';
import { filterEntries, flatten, isEmpty, mapValues, without } from '../../../util/objTransforms';
import {
  IconBabyCarriage, IconBinaryTree, IconChristmasTree, IconLadder, IconPencilPlus, IconPlant, IconWritingSign
} from '@tabler/icons-react';
import generateSentence from './generateSentence';

interface BeginnersGuideProps {
  plotState: UnpositionedPlot;
  onComplete: () => void;
}

/**
 * Determines whether this tree is "complete" by checking whether it has only one undominated node.
 * This is a bad metric because a tree can have a single undominated node without being complete.
 * TODO: Make this smarter
 */
const isComplete = (tree: UnpositionedTree) => {
  const allChildIds = flatten(mapValues(tree.nodes, node => isBranching(node) ? node.children : []));
  const allNodeIds = Object.keys(tree.nodes);
  const topLevelNodeIds = without(allNodeIds, allChildIds);
  return topLevelNodeIds.length === 1 && tree.nodes[topLevelNodeIds[0]].label.length > 0;
};

const steps = [
  {
    icon: IconPlant,
    title: "Plant your first tree",
    body: `Click anywhere on the board and enter a sentence, like "${generateSentence()}".`
  },
  {
    icon: IconPencilPlus,
    title: "Add your first node",
    body: <>Once you're done typing, click <b>above</b> any of the words to add a corresponding node and give it a label
      (e.g. N, V, Conj, etc.).</>,
  },
  {
    icon: IconWritingSign,
    title: "Add more nodes",
    body: "Click above each word to add a node for it.",
  },
  {
    icon: IconBabyCarriage,
    title: "Give them parents",
    body: "Once you have enough nodes at the bottom of the tree, click directly above a node to add a parent node for it.",
  },
  {
    icon: IconBinaryTree,
    title: "Branch out",
    body: "Click above the space between two adjacent nodes to add a parent node for both of them.",
  },
  {
    icon: IconLadder,
    title: "Up we go!",
    body: "Continue adding nodes until the tree is complete.",
  },
  {
    icon: IconChristmasTree,
    title: "That's it!",
    body: "Congratulations, you just built a syntax tree!",
  },
];

const BeginnersGuide: React.FC<BeginnersGuideProps> = ({ plotState, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const previousPlotState = useRef<UnpositionedPlot>();

  useEffect(() => {
    const tree = isEmpty(plotState.trees) ? undefined : Object.values(plotState.trees)[0];
    if (!tree) return;
    if (currentStepIndex === 0 && tree.sentence.length >= 15) setCurrentStepIndex(1);
    else if (currentStepIndex === 1 && !isEmpty(tree.nodes) && Object.values(tree.nodes)[0].label.length > 0) setCurrentStepIndex(2);
    else if (currentStepIndex === 2 && Object.values(tree.nodes).length >= 2) setCurrentStepIndex(3);
    else if (currentStepIndex === 3 && !isEmpty(filterEntries(tree.nodes,
      ([_, node]) => node.label.length > 0 && isBranching(node))))
      setCurrentStepIndex(4);
    else if (currentStepIndex === 4 && !isEmpty(filterEntries(tree.nodes,
      ([_, node]) => node.label.length > 0 && isBranching(node) && node.children.length >= 2)))
      setCurrentStepIndex(5);
    else if (currentStepIndex === 5 && isComplete(tree)) setCurrentStepIndex(6);
    else if (currentStepIndex === 6 && plotState !== previousPlotState.current) onComplete();
    previousPlotState.current = plotState;
  }, [currentStepIndex, plotState, onComplete]);

  const currentStep = steps[currentStepIndex];

  return <div className="BeginnersGuide">
    <Alert icon={<currentStep.icon />} title={currentStep.title} withCloseButton={false}>
      {currentStep.body}
    </Alert>
  </div>;
};

export default BeginnersGuide;

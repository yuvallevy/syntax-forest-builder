import './Toolbar.scss';

export type ToolbarItem = {
  title: string;
  icon?: React.ReactNode;
  action: () => void;
};

interface ToolbarProps {
  items: ToolbarItem[];
}

const Toolbar: React.FC<ToolbarProps> = ({ items }) =>
  <div className="Toolbar">
    {items.map(item =>
      <button className="Toolbar--button" onClick={item.action} key={item.title}>
        {item.title}
      </button>
    )}
  </div>;

export default Toolbar;

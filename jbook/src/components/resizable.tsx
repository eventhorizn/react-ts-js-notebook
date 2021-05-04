import './resizable.css';
import { ResizableBox } from 'react-resizable';

interface ResizableProps {
	direction: 'horizontal' | 'vertical';
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
	return (
		<ResizableBox
			minConstraints={[Infinity, 50]}
			maxConstraints={[Infinity, window.innerHeight * 0.9]}
			height={300}
			width={Infinity}
			resizeHandles={['s']}
		>
			{children}
		</ResizableBox>
	);
};

export default Resizable;

import React from 'react';
import { useTypedSelector } from '../hooks/use-typed-selector';
import CellListItem from './cell-lilst-item';

const CellList: React.FC = () => {
	// getting the data from our cells in order
	const cells = useTypedSelector(({ cells: { order, data } }) => {
		return order.map((id) => {
			return data[id];
		});
	});

	const renderedCells = cells.map((cell) => (
		<CellListItem key={cell.id} cell={cell} />
	));

	return <div>{renderedCells}</div>;
};

export default CellList;

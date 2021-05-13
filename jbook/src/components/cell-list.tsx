import React, { Fragment } from 'react';
import { useTypedSelector } from '../hooks/use-typed-selector';
import CellListItem from './cell-lilst-item';
import AddCell from './add-cell';

const CellList: React.FC = () => {
	// getting the data from our cells in order
	const cells = useTypedSelector(({ cells: { order, data } }) => {
		return order.map((id) => {
			return data[id];
		});
	});

	const renderedCells = cells.map((cell) => (
		<Fragment key={cell.id}>
			<AddCell nextCellId={cell.id} />
			<CellListItem cell={cell} />
		</Fragment>
	));

	return (
		<div>
			{renderedCells}
			<AddCell nextCellId={null} />
		</div>
	);
};

export default CellList;

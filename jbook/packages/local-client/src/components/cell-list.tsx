import './cell-list.css';
import React, { Fragment, useEffect } from 'react';
import { useTypedSelector } from '../hooks/use-typed-selector';
import CellListItem from './cell-lilst-item';
import AddCell from './add-cell';
import { useActions } from '../hooks/use-actions';

const CellList: React.FC = () => {
	// getting the data from our cells in order
	const cells = useTypedSelector(({ cells: { order, data } }) => {
		return order.map((id) => {
			return data[id];
		});
	});
	const { fetchCells } = useActions();

	useEffect(() => {
		fetchCells();
	}, []);

	const renderedCells = cells.map((cell) => (
		<Fragment key={cell.id}>
			<CellListItem cell={cell} />
			<AddCell prevCellId={cell.id} />
		</Fragment>
	));

	return (
		<div className="cell-list">
			<AddCell forceVisible={cells.length === 0} prevCellId={null} />
			{renderedCells}
		</div>
	);
};

export default CellList;

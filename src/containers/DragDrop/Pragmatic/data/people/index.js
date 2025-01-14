/**
 * These imports are written out explicitly because they
 * need to be statically analyzable to be uploaded to CodeSandbox correctly.
 */
import Alexander from './images/processed/Alexander';
import Aliza from './images/processed/Aliza';
import Alvin from './images/processed/Alvin';
import Angie from './images/processed/Angie';
import Arjun from './images/processed/Arjun';
import Blair from './images/processed/Blair';
import Claudia from './images/processed/Claudia';
import Colin from './images/processed/Colin';
import Ed from './images/processed/Ed';
import Effie from './images/processed/Effie';
import Eliot from './images/processed/Eliot';
import Fabian from './images/processed/Fabian';
import Gael from './images/processed/Gael';
import Gerard from './images/processed/Gerard';
import Hasan from './images/processed/Hasan';
import Helena from './images/processed/Helena';
import Ivan from './images/processed/Ivan';
import Katina from './images/processed/Katina';
import Lara from './images/processed/Lara';
import Leo from './images/processed/Leo';
import Lydia from './images/processed/Lydia';
import Maribel from './images/processed/Maribel';
import Milo from './images/processed/Milo';
import Myra from './images/processed/Myra';
import Narul from './images/processed/Narul';
import Norah from './images/processed/Norah';
import Oliver from './images/processed/Oliver';
import Rahul from './images/processed/Rahul';
import Renato from './images/processed/Renato';
import Steve from './images/processed/Steve';
import Tanya from './images/processed/Tanya';
import Tori from './images/processed/Tori';
import Vania from './images/processed/Vania';

const avatarMap = {
	Alexander,
	Aliza,
	Alvin,
	Angie,
	Arjun,
	Blair,
	Claudia,
	Colin,
	Ed,
	Effie,
	Eliot,
	Fabian,
	Gael,
	Gerard,
	Hasan,
	Helena,
	Ivan,
	Katina,
	Lara,
	Leo,
	Lydia,
	Maribel,
	Milo,
	Myra,
	Narul,
	Norah,
	Oliver,
	Rahul,
	Renato,
	Steve,
	Tanya,
	Tori,
	Vania,
};

const names = Object.keys(avatarMap);

const roles = [
	'Engineer',
	'Senior Engineer',
	'Principal Engineer',
	'Engineering Manager',
	'Designer',
	'Senior Designer',
	'Lead Designer',
	'Design Manager',
	'Content Designer',
	'Product Manager',
	'Program Manager',
];

let sharedLookupIndex = 0;

/**
 * Note: this does not use randomness so that it is stable for VR tests
 */
export function getPerson() {
	sharedLookupIndex++;
	return getPersonFromPosition({ position: sharedLookupIndex });
}

export function getPersonFromPosition({ position }) {
	// use the next name
	const name = names[position % names.length];
	// use the next role
	const role = roles[position % roles.length];
	return {
		userId: `id:${position}`,
		name,
		role,
		avatarUrl: avatarMap[name],
	};
}

export function getPeopleFromPosition({ amount, startIndex }) {
	return Array.from({ length: amount }, () => getPersonFromPosition({ position: startIndex++ }));
}

export function getPeople({ amount }) {
	return Array.from({ length: amount }, () => getPerson());
}

export function getData({ columnCount, itemsPerColumn }) {
	const columnMap = {};

	for (let i = 0; i < columnCount; i++) {
		const column = {
			title: `Column ${i}`,
			columnId: `column-${i}`,
			items: getPeople({ amount: itemsPerColumn }),
		};
		columnMap[column.columnId] = column;
	}
	const orderedColumnIds = Object.keys(columnMap);

	return {
		columnMap,
		orderedColumnIds,
		lastOperation: null,
	};
}

export function getBasicData() {
	const columnMap = {
		confluence: {
			title: 'Confluence',
			columnId: 'confluence',
			items: getPeople({ amount: 10 }),
		},
		jira: {
			title: 'Jira',
			columnId: 'jira',
			items: getPeople({ amount: 10 }),
		},
		trello: {
			title: 'Trello',
			columnId: 'trello',
			items: getPeople({ amount: 10 }),
		},
	};

	const orderedColumnIds = ['confluence', 'jira', 'trello'];

	return {
		columnMap,
		orderedColumnIds,
	};
}

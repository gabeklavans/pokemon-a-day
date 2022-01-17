import "./main.css";
import { shuffle } from "shuffle-seed";
import {} from "date-fns";
import CPokedex, {
	Pokemon,
	PokemonSpecies,
	PokemonSpeciesFlavorTextEntry,
} from "pokedex-promise-v2";
import getDayOfYear from "date-fns/getDayOfYear";
import getDaysInYear from "date-fns/getDaysInYear";
import format from "date-fns/format";
import startOfDay from "date-fns/startOfDay";
const P = new CPokedex();

// initialize globals
const NUM_POKEMON = 898;
const DEX_ID_LIST = Array(NUM_POKEMON + 1)
	.fill(0)
	.map((_, i) => i)
	.splice(1);

let curDate = startOfDay(new Date());

// initialize calendar
$("#day").text(format(curDate, "EEEE").toUpperCase());
$("#date-string").text(format(curDate, "MMMM d").toUpperCase());

dateToPokemon(curDate)
	.then((pokemon) => {
		const name = $("#name") as JQuery<HTMLHeadingElement>;
		name.text(formatName(pokemon.pokemon.name));

		const sprite = $("#sprite") as JQuery<HTMLImageElement>;
		sprite.attr(
			"src",
			pokemon.pokemon.sprites.other["official-artwork"].front_default
		);

		const entry = $("#entry") as JQuery<HTMLParagraphElement>;
		const flavorTexts = pokemon.species.flavor_text_entries.filter(
			(fText) => {
				return fText.language.name == "en";
			}
		);
		const flavorTextEntry =
			sample<PokemonSpeciesFlavorTextEntry>(flavorTexts);
		const flavorText =
			flavorTextEntry.flavor_text + ` (${flavorTextEntry.version.name})`;
		// this weird invisible char keeps showing up
		entry.text(flavorText.replace("", " "));

		$("#type").text(
			formatNoun(
				pokemon.pokemon.types.map((type) => type.type.name).join("/")
			)
		);

		const genus = pokemon.species.genera.find(
			(genus) => genus.language.name == "en"
		)?.genus;
		if (genus) {
			$("#category").text(formatNoun(genus));
		}

		$("#height").text(pokemon.pokemon.height / 10.0 + " m");

		$("#weight").text(pokemon.pokemon.weight / 10.0 + " kg");
	})
	.catch((e) => {
		console.error(e);
	});

async function dateToPokemon(date: Date) {
	const yearStr = date.getFullYear().toString();
	// this will always be the same list for a given year
	const randomDexIds = shuffle(DEX_ID_LIST, yearStr).slice(
		0,
		getDaysInYear(date)
	);
	const dexId = randomDexIds[getDayOfYear(date) - 1];

	const pokemon = (await P.getPokemonByName(dexId)) as Pokemon;
	const species = (await P.getPokemonSpeciesByName(dexId)) as PokemonSpecies;

	return {
		pokemon,
		species,
	};
}

function formatName(str: string) {
	let tokens = str.split("-");

	return tokens.join(" ").toLocaleUpperCase();
}

function formatNoun(str: string) {
	return str[0].toLocaleUpperCase() + str.slice(1).toLocaleLowerCase();
}

function sample<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

console.log("Hi");

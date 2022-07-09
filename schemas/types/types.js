let typesEnum = ["fire", "grass", "water", "eletric", "normal"];

let typesList = [
    {
        name: "fire",
        rgb: [255, 0, 0],
        moves: {
            "Ember": {
                power: 35,
                type: 'fire'
            , accuracy: 0.85 , mp: 5 } ,
            "Fire Blast": {
                power: 100,
                type: 'fire'
            , accuracy: 0.85 , mp: 5 } ,
            "Flamethrower": {
                power: 80,
                type: 'fire'
            , accuracy: 0.85 , mp: 5 } ,
            "Tackle": {
                power: 40,
                type: 'normal'
            , accuracy: 0.85 , mp: 5 } ,
        }
     } ,
    {
        name: "grass",
        rgb: [0, 255, 0],
        moves: {
            "Vine Whip": {
                power: 35,
                type: 'grass'
            , accuracy: 0.85 , mp: 5 } ,
            "Solar Beam": {
                power: 100,
                type: 'grass'
            , accuracy: 0.85 , mp: 5 } ,
            "Leech Seed": {
                power: 80,
                type: 'grass'
            , accuracy: 0.85 , mp: 5 } ,
            "Tackle": {
                power: 40,
                type: 'normal'
            , accuracy: 0.85 , mp: 5 } ,
        }
    } ,
    {
        name: "water",
        rgb: [0, 0, 255],
        moves: {
            "Water Gun": {
                power: 35,
                type: 'water'
            , accuracy: 0.85 , mp: 5 } ,
            "Hydro Pump": {
                power: 100,
                type: 'water'
            , accuracy: 0.85 , mp: 5 } ,
            "Surf": {
                power: 80,
                type: 'water'
            , accuracy: 0.85 , mp: 5 } ,
            "Tackle": {
                power: 40,
                type: 'normal'
            , accuracy: 0.85 , mp: 5 } ,
        }
     } ,

    {
        name: "electric",
        rgb: [225, 225, 0],
        moves: {
            "Spark": {
                power: 35,
                type: 'electric'
            , accuracy: 0.85 , mp: 5 } ,
            "Thunder": {
                power: 100,
                type: 'electric'
            , accuracy: 0.85 , mp: 5 } ,
            "Thunderbold": {
                power: 80,
                type: 'electric'
            , accuracy: 0.85 , mp: 5 } ,
            "Tackle": {
                power: 40,
                type: 'normal'
            , accuracy: 0.85 , mp: 5 } ,
        }
    } ,

    // {
    //     name: "normal",
    //     rgb: [0, 0, 0],
    //     moves: {
    //         "Tackle": {
    //             power: 35,
    //             type: 'normal'
    //         , accuracy: 0.85 , mp: 5 } ,
    //         "Slam": {
    //             power: 80,
    //             type: 'normal'
    //         , accuracy: 0.85 , mp: 5 } ,
    //         "Hyper Beam": {
    //             power: 100,
    //             type: 'normal'
    //         , accuracy: 0.85 , mp: 5 } ,
    //         "Quick Attack": {
    //             power: 40,
    //             type: 'normal'
    //         }
    //     }
    // }
]

module.exports = {typesEnum, typesList}
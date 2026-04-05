import { amazingPart3Score } from './01_amazing_part3.js';
import { moreBeautifulScore } from './02_more_beautiful.js';
import { parametricFocusedScore } from './03_parametric_focused.js';

export const scoreCatalog = [
    amazingPart3Score,
    moreBeautifulScore,
    parametricFocusedScore
];

export function getScoreById(scoreId) {
    return scoreCatalog.find((score) => score.id === scoreId) || null;
}

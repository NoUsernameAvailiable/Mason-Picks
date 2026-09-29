import { historicalStanding } from '../utils/coursePresentation';

export default function HistoricalStanding({ course, sectionMap }) {
    const standing = historicalStanding(course, sectionMap?.get(course.courseKey));
    return standing ? <span className="historical-standing" title="Compared with other instructors for this course in the available records. Historical averages can cover different terms and student counts.">{standing}</span> : null;
}

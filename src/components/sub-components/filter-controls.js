import React, { useState, useEffect  } from 'react';
import {generalSearch} from '../../actions/lessonActions';
import {getStudentsAsync} from '../../actions/studentActions';
import {getUsersAsync} from '../../actions/userActions';
import {connect} from 'react-redux';
import DatePicker from './date-picker';
import Grid from '@material-ui/core/Grid';
import {useGetStudents,useGetTeachers} from '../../effects/getData';
import {useFilterLessons} from '../../effects/filterLessons';
import FilterControl from './filter-control';
import Button from '@material-ui/core/Button';
import './styles/filter-controls.css';

function FilterControls(props){
    const startDateType = 'startDate';
    const endDateType = 'endDate';
    const studentTarget = 'fullName';
    const teacherTarget = 'username';

    const setInitialDates = () => {
        let startDate = !props.startDate ? new Date() : new Date(props.startDate);
        startDate.setDate(startDate.getDate() + 1);
        let endDate = !props.endDate ? new Date(startDate) : new Date(props.endDate);
        endDate.setDate(endDate.getDate() + 1);
        const defaultRange = 30;
        endDate.setDate(endDate.getDate() - defaultRange);
        let dates = [startDate,endDate];

        return dates;
    }

    const dateUpdated = (event, dateField) => {
        let newDate = new Date(event);
        console.log('updating date');
        let curFilters = {...filters};
        if(dateField === startDateType){
            curFilters.startDate = newDate;
        }
        else if(dateField === endDateType){
            curFilters.endDate = newDate;
        }
        setFilters(curFilters);
    }

    const filterChanged = (newVal,changeType) =>{
        let curFilters = {...filters};
        console.log(newVal);

        try{
            if(changeType === studentTarget){
                curFilters.studentId = newVal ? newVal.id : null;
                curFilters.selectedStudent = newVal;
            }
            else if(changeType === teacherTarget){
                curFilters.teacherId = newVal ? newVal.id : null;
                curFilters.selectedTeacher = newVal;
            }
            if(props.filterChanged){
                props.filterChanged(newVal,changeType);
            }
            setFilters(curFilters);
        }
        catch(e){
            console.log('error updating filters',e);
        }

    }

    const dates = setInitialDates();
    const [filters,setFilters] = useState({
        teacherId:null,
        studentId:props.studentId ? props.studentId : null,
        startDate:dates[0],
        endDate:dates[1],
        selectedTeacher:props.teacher ? props.teacher : null,
        selectedStudent:props.student ? props.student : null,
        selectedDate:props.date ? props.date : null
    });
    
    //effect to get lessons
    useFilterLessons(filters,props.dispatch);
    //could eventually extract to cust effect?
    useEffect(() => {
        let currFilter = {...filters};
        currFilter.studentId = props.student ? props.student.id : null;
        currFilter.teacherId = props.teacher ? props.teacher.id : null;
        currFilter.selectedStudent = props.student;
        currFilter.selectedTeacher = props.teacher;
        setFilters(currFilter);
     }, [props.teacher,props.student]);

    useEffect(() => {
        let currFilter = {...filters};
        if(props.selectedDate){
            let tomorrow = new Date(props.selectedDate);
            tomorrow.setDate(props.selectedDate.getDate() + 1);
            currFilter.startDate = tomorrow;
            currFilter.endDate = props.selectedDate;
            currFilter.selectedDate = props.selectedDate;
        }
        setFilters(currFilter);
     }, [props.selectedDate]);
     

    const allStudents = useGetStudents(props.authToken);
    const allTeachers = useGetTeachers(props.authToken);
     
    console.log('all teachers',allTeachers);
    console.log('all students',allStudents)

    const studentFilter = allStudents ? (<FilterControl responses={allStudents} target={studentTarget} changeData={studentTarget} filterChanged={filterChanged} title={"Name"} value={filters.selectedStudent} ignoreEmpty={true}/>) : null;
    const teacherFilter = allTeachers ? (<FilterControl responses={allTeachers} target={teacherTarget} changeData={teacherTarget} filterChanged={filterChanged} title={"Email"} value={filters.selectedTeacher} ignoreEmpty={true}/>) : null;
    return(
        <Grid container>
            <Grid item md={3} xs={12}>
                {studentFilter}
            </Grid>
            <Grid item md={3} xs={12}>
                {teacherFilter}
            </Grid>
            <Grid item md={3} xs={12}> 
                <DatePicker 
                label="Start Date" 
                dateVal={filters.endDate} 
                dateUpdated={dateUpdated} target="endDate"/>
            </Grid>
            <Grid item md={3} xs={12}>
                <Grid item container xs={12} alignItems="center">
                        <DatePicker 
                        label="End Date" 
                        dateVal={filters.startDate} 
                        dateUpdated={dateUpdated} target="startDate"/>
                </Grid>
            </Grid>
        </Grid>
    )
}

const mapStateToProps = state => ({
    authToken: state.auth.authToken
});

export default connect(mapStateToProps)(FilterControls);
import React from 'react';
import requiresLogin from '../HOC/requires-login';
import { withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import { MenuItem, Icon } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import {getStudents} from '../actions/studentActions';
import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined';
import IconButton from '@material-ui/core/IconButton';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import Help from '@material-ui/icons/Help';
import {saveLesson,updateLesson,getStudentLesson} from '../actions/lessonActions';
import SnackbarWrapper from './snackbar-wrapper';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider,KeyboardDatePicker,KeyboardTimePicker } from '@material-ui/pickers';
import SimpleModal from './sub-components/simple-modal';
import LessonDisplay from './sub-components/lesson-display';
import Tooltip from '@material-ui/core/Tooltip';
import './styles/create-lesson.css';

export class CreateLesson extends React.Component{
    constructor(props) {
        super(props);
        this.createPath = 'create-lesson';
        this.studentModal = 'studentModalOpen';
        this.state = {
            teacher:this.props.currentUser.id,
            students:[],
            notes:'',
            date: new Date(),
            lessonType:'Finger Style',
            studentCount:1,
            saved:false,
            savedMessage:'Saved',
            time:null,
            modalOpen:false,
            modalMessage:'Are you sure you want to create a class with no students?',
            studentModalOpen:false
        };
    }

    componentDidMount(){
        this.props.dispatch(getStudents())

        .then(response => {
            let currentStudents = [...this.state.students];
            currentStudents.push({
                id:this.props.students[0].id,
                fullName:this.props.students[0].fullName
            });
            this.setState({
                students:currentStudents
            },() => {
                this.checkSelectedLesson()
            });
        })

        .catch(err => {

        });
    }

    componentWillUnmount(){
        //this.props.dispatch(setSelectedLesson(null));
    }

    checkEditMode = () => {
        return !this.props.location.pathname.includes(this.createPath);
    }

    checkSelectedLesson = () =>{
        console.log(this.props.selectedLesson);
        let isEdit = this.checkEditMode();
        if(this.props.selectedLesson && isEdit){
            let selectedLesson = this.props.selectedLesson;
            this.setState({
                teacher:selectedLesson.teacher._id,
                students:selectedLesson.students,
                notes:selectedLesson.notes,
                date: new Date(selectedLesson.date),
                lessonType:selectedLesson.lessonType,
                studentCount:selectedLesson.students.length,
                time: new Date(selectedLesson.date)
            });
        }
    }

    fieldChanged = (event,field) => {
        event.persist();
        let value = event.target.value;
        this.setState({
            [field]:value
        });
    }

    findStudent(id){
        return this.props.students.find(student => student.id === id);
    }

    studentChanged = (event,index) => {
        event.persist();
        let value = event.target.value;
        let students = [...this.state.students];
        let selectedStudent = this.findStudent(value);
        let newStudent = {
            id:selectedStudent.id,
            fullName:selectedStudent.fullName
        };
        students[index] = newStudent;

        this.setState({
            students
        });
    }

    getStudentLessons = async (id) =>{
        try{
            await this.props.dispatch(getStudentLesson(id))
            this.modalOpened(this.studentModal);
        }
        catch(err){
            console.log(err);
        }
        
    }


    buildStudentSelect = () => {
        let studentSelect = [];

        for(let i = 0;i < this.props.students.length;i++){
            const item = this.props.students[i];
            studentSelect.push(
                <MenuItem value={item.id} key={i}>{item.fullName}</MenuItem>
            );  
        }

        let selects = [];

        for(let i = 0;i < this.state.studentCount;i++){
            selects.push(
                <Grid className="student-row" item xs={12} md={3} key={i}>
                    <Tooltip title="See Previous Lessons">
                        <IconButton onClick={(e) => this.getStudentLessons(this.state.students[i].id)} aria-label="student lessons">
                            <Help/>
                        </IconButton>
                    </Tooltip>
                    <Select onChange={(e) => this.studentChanged(e,i)} value={this.state.students[i].id} >{studentSelect}</Select>
                    <Tooltip title="Remove Student">
                        <IconButton onClick={(e) => this.removeStudent(i)} aria-label="remove student">
                            <CancelOutlinedIcon/>
                        </IconButton>
                    </Tooltip>
                </Grid>
            )
        }

        let finalSelect = [];
        finalSelect.push(
            <Grid container item xs={12} key={0}>
                {selects}
            </Grid>
        );
        
        return finalSelect;
    }

    buildLessonSelect = () => {
        let lessonItems = [];
        for(let i = 0;i < this.props.lessonTypes.length;i++){
            const item = this.props.lessonTypes[i];
            lessonItems.push(
                <MenuItem value={item} key={i}>{item}</MenuItem>
            );
        }

        return lessonItems;
    }

    addStudent = () => {
        const studentCount = this.state.studentCount + 1;
        const blankStudent = {
            id:this.props.students[0].id,
            fullName:this.props.students[0].fullName
        };
        let students = [...this.state.students];
        students.push(blankStudent);
        this.setState({
            studentCount,
            students
        });
    }

    removeStudent = (index) => {
        const studentCount = this.state.studentCount - 1;
        let students = this.state.students.filter((student,i) => i !== index);

        this.setState({
            studentCount,
            students
        });
    }

    saveLesson = (event,checkedModal) => {
        if(event){
            event.persist();
            event.preventDefault();
        }
        if(!checkedModal && this.state.students.length === 0){
            this.setState({
                modalOpen:true
            });
            return;
        }
        this.setState({
            modalOpen:false
        });
        let isEdit = this.checkEditMode();
        let dateTime  = new Date(this.state.date.getFullYear(), this.state.date.getMonth(), this.state.date.getDate(), this.state.time.getHours(), this.state.time.getMinutes(),0); 
        
        const lesson = {
            date:dateTime,
            lessonType:this.state.lessonType,
            notes:this.state.notes,
            teacher:this.state.teacher,
            students:this.state.students.map(student => student.id)
        }
        if(!isEdit){
        
            //console.log(lesson);

            this.props.dispatch(saveLesson(lesson))

            .then(res => {
                let {code} = res;
                
                if(code === 200){
                    this.setState({
                        saved:true,
                        savedMessage:'Lesson Saved!'
                    });
                }
                else{
                    this.setState({
                        saved:true,
                        savedMessage:'Error saving lesson'
                    });
                }
            })

            .catch(err => {
                console.log(err);
            });
        }
        else{
            const lesson = {
                date:dateTime,
                lessonType:this.state.lessonType,
                notes:this.state.notes,
                teacher:this.state.teacher,
                students:this.state.students.map(student => student.id),
                id:this.props.selectedLesson.id
            }

            //console.log(lesson);

            this.props.dispatch(updateLesson(lesson))

            .then(res => {
                let {code} = res;
                
                if(code === 200){
                    this.setState({
                        saved:true,
                        savedMessage:'Lesson Updated!'
                    });
                }
                else{
                    console.log(res)
                    this.setState({
                        saved:true,
                        savedMessage:'Error updating lesson'
                    });
                }
            })

            .catch(err => {
                console.log(err);
            });
        }
        
    }

    snackbarClosed = (name) => {
        this.setState({
            [name]:false
        });
    }

    handleDateChange = (event) =>{
        let date = new Date(event);
        this.setState({
            date
        });
    }

    handleTimeChange = (event) =>{
        let time = new Date(event);
        this.setState({
            time
        });
    }

    modalOpened = (name) => {
        this.setState({
            [name]:true
        });
    }

    modalClosed = (name) => {
        this.setState({
            [name]:false
        });
    }

    modalSubmitted = () => {
        this.saveLesson(null,true)
    }

    buildStudentLessons = () => {
        let lessons = [];

        for(let i = 0;i < this.props.studentLessons.length;i++){
            let lesson = this.props.studentLessons[i];
            let list = (<p>{lesson.id} : {lesson.lessonType}</p>);
            lessons.push(list);
        }

        return lessons;
    }

    render(){
        //console.log(this.state);
        console.log(this.props);
        let lessonItems = this.props.lessonTypes ? this.buildLessonSelect() : [];
        let studentItems = this.props.students && this.state.students.length > 0 ? this.buildStudentSelect() : [];
        let studentLessonList = this.props.studentLessons ? (<LessonDisplay studentLessons={this.props.studentLessons}/>) : null;
        
        return(
            <div>
                <form onSubmit={(e) => this.saveLesson(e)}>
                    <Grid container>
                        <Grid item sm={6} xs={12}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                                margin="normal"
                                id="date-picker-dialog"
                                label="Lesson Date"
                                format="MM/dd/yyyy"
                                value={this.state.date}
                                onChange={this.handleDateChange}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                                required
                            />
                        </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item sm={6} xs={12}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardTimePicker
                            margin="normal"
                            id="time-picker"
                            label="Lesson Time"
                            value={this.state.time}
                            onChange={this.handleTimeChange}
                            KeyboardButtonProps={{
                                'aria-label': 'change time',
                            }}
                            required
                        />
                        </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField required className="notes-field" label="Notes" id="notes" multiline rows="5" value={this.state.notes} onChange={(e) => this.fieldChanged(e,'notes')}/>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <div className="lesson-container">
                                <InputLabel id="lessonType">Lesson Type</InputLabel>
                                <Select onChange={(e) => this.fieldChanged(e,'lessonType')} id="lessonType" value={this.state.lessonType}>
                                    {lessonItems}
                                </Select>
                            </div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Tooltip title="Add a Student">
                                <IconButton aria-label="add student" onClick={(e) => this.addStudent()}>
                                    <AddCircleOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                            <InputLabel className="student-label" id="student">Students</InputLabel>
                            {studentItems}
                        </Grid>
                        <Grid className="" item xs={12}>
                            <Button type="submit" variant="contained">{this.props.editable ? 'Update' : 'Save'}</Button>
                        </Grid>
                    </Grid>
                </form>
                
                <SnackbarWrapper saved={this.state.saved} snackbarClosed={this.snackbarClosed} saveField={"saved"} savedMessage={this.state.savedMessage}/>
                <SimpleModal open={this.state.modalOpen} handleClose={this.modalClosed} submitClick={this.modalSubmitted} message={this.state.modalMessage} name={"modalOpen"}/>
                <SimpleModal open={this.state.studentModalOpen} handleClose={this.modalClosed} name={this.studentModal}>
                    {studentLessonList}
                </SimpleModal>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    currentUser: state.auth.currentUser,
    lessonTypes:['Finger Style','Chords', 'Rythm'],
    students:state.students.students,
    selectedLesson:state.lessons.selectedLesson,
    studentLessons:state.lessons.studentLessons
});
export default requiresLogin()(withRouter(connect(mapStateToProps)(CreateLesson)));
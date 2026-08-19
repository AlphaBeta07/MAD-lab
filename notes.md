# stylesheet : style sheet component
- react native does not use css file so instead it use css stylesheet component
- it stores all styles in one place
- advantage
- reuseable, link code and easy to repair

# flexbox  
- we dont use fixed size so we can use flexbox

        <flexbox flexdirection : 'Row'>
        <flexbox flexdirection : 'Column' align : 'center'>


# scrollview 
- it renders everything at once
- suitable for small amount of data
- example - profile page, terms n condition, about us etc

# faltlist 
- load only visible items
- best for large data
- example - whatsapp chat, amazon etc

# activity 3  
- create fruitlist using flatlist
- create about page for college for 10 para using scrollview

# viva que
- why do we use view component
- diff text and view
- what is stylesheet
- why use flexbox
- what is default felx direction
- diff justify-content and align-text
- what is flex
- when we use scrollview, flatlist
- why flatlist is faster
- what makes ui responseive
- why avoid inline styles


# store input by data
- form validation
- validation - check wether input is correct before accepting it 


# useState
- useState is react hook, used to store and manage data that can change during the execution of a component.
- it allows you to add and track state variables inside the function components
- when state data is changed react automaticly re-renders the component to 


- State - the current value of your state variable.
- setState - the updated function used to change the value.
- const[email, setEmail] = useState('');
        

# activity4
- watch react-native prop video
- write 2 example of react-navtive props
- what is diff react props and react-native props with 1 example
- useState, useEffect cideos with 2 examples
- understand and learn diff types react-native hooks 
- learn diff react hooks


# props:
- it means properties
- it configures variables
- these are read only configure are used to pass data from parent component to child component
-  there are types of it
1. passing props
- there are two files 
- app.tsx (prent component)
- greeting.tsx(child component)
2. using destructuring
- instead of writing props.name you can destructure the porps
3. multiple props
- function user card


        function usercard({name, id, email}){
            {
                return
            }

        }

## diff bet props and state?
- props pass data from parent, state managed by the component itself
- props read only proprety, state can be updated 
- porps used to configure component, state used to store changing data

# TouchableOpacitity 
- it is react-native components used to make something touchable/tapable
- 
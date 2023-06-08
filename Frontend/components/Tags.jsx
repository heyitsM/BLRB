import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useEffect, useState } from "react";
import {Chip, Input, styled} from "@mui/material";
import getAllTags from "../api/tags";

const NormalTextField = styled(TextField)((theme) =>( {
  "& label.Mui-focused": {
    color: "#EA526F"
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#EA526F"
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderRadius: 20,
      borderColor: "#bdbdbd"
    },
    "&:hover fieldset": {
      borderColor: "#ffffff"
    },
    "&.Mui-focused fieldset": {
      borderRadius: 20,
      borderColor: "#EA526F"
    }
  }, 
  "& div.MuiAutocomplete-endAdornment .MuiSvgIcon-root": {
    color: "#EA526F"
  }, 
}));

const SearchTextField = styled(TextField)((theme) =>( {
  "& label.Mui-focused": {
    color: "#ffffff"
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#2a2a2a"
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderRadius: 20,
      borderColor: "#2a2a2a"
    },
    "&:hover fieldset": {
      borderColor: "#2a2a2a"
    },
    "&.Mui-focused fieldset": {
      borderRadius: 20,
      borderColor: "#2a2a2a"
    }
  }, 
  "& div.MuiAutocomplete-endAdornment .MuiSvgIcon-root": {
    color: "#ffffff"
  }, 
}));

function Tags(props) {
  const { mode, tags, setTags, preSelectedTag,} = props;
  const [ selectedTags, setSelectedTags] = useState([]);
  const options = ["Abstract", "Acrylic Paint", "Anatomy", "Animals & Wildlife", "Anime", 
                    "Architectural Concepts", "Architectural Visualization", "Automotive", 
                    "Board and Card Game Art", "Book Illustration", "Character Animation", 
                    "Character Design", "Character Modeling", "Chalk", "Charcoal", "Children's Art", 
                    "Clay", "Collage","Colored Pencil","Comic Art", "Cover Art", "Creatures & Monsters", 
                    "Digital Art", "Digital Sketch", "Editorial Illustration", 
                    "Environmental Concept Art & Design", "Fan Art", "Fantasy", "Fashion and Costume Design",
                    "Game Art", "Gameplay and Level Design", "Games and Real-Time 3D Environmental Art", 
                    "Gouache", "Graphic Design", "Hard Surface", "Horror", "Illustration", 
                    "Industrial and Product Design",  "Ink", "Lighting", "Manga", "Matte Painting", 
                    "Mecha", "Mechanical Design", "Mixed Media",  "Motion Graphics", "Pastel", 
                    "Photogrammetry and 3D Scanning", "Pixel and Voxel", "Photography","Portrait",
                    "Printmaking","Props", "Oil Painting","Realism", "References", "Science Fiction",
                    "Scientific Illustration and Visualization", "Script and Tools", "Sculpture", "Sketches", 
                    "Still Life", "Storyboards", "Stylized", "Technical Art", "Textures & Materials", 
                    "Tutorials", "User Interface", "Vehicles", "VFX", "Visual Development", "Watercolor",
                    "Weapons", "Web and App Design"]


  useEffect(() => {
    // if a tag has already been selected, add it to tags!

    if (preSelectedTag) {
      let str = preSelectedTag;
      let temp = [];
      temp.push(str)
      setTags(temp);
    }
  }, [])

  const removeOption = (tag) => {
    let tagStr = [];
    let selectedTagTemp = [];

    for (let obj of selectedTags) {
      if (obj.title !== tag) {
        tagStr.push(obj.title);
        selectedTagTemp.push(obj)
      }
    }

    setSelectedTags(selectedTagTemp)
    setTags(tagStr);
  }

  useEffect(() => {
    if (tags) {
      let tempTags = [];
      for (let t of tags) {
        tempTags.push({title:t})
      }
      setSelectedTags(tempTags)
    }
  }, [tags])
  
  const handleOnChange = (event, values) => {
    if (values.length === 0) {
      setTags([]);
      setSelectedTags([]);
    }

    if (tags.length < 20) {
      let tagStr = [];
      let formalValues = [];
      for (let obj of values) {
        if (typeof obj === 'string') {
          tagStr.push(obj);
          formalValues.push({title:obj})
        } else {
          tagStr.push(obj.title);
          formalValues.push(obj);
        }
      }
      
      setSelectedTags(formalValues)
      setTags(tagStr);
    } 
  };

  return (
    <>
      <Autocomplete
        sx={{ minWidth:"30%", maxWidth:(mode ? "30%" : "100%")}}
        multiple
        freeSolo
        value={selectedTags}
        id="tags-standard"
        limitTags={5}
        data-testid="autocomplete"
        options={options}
        onChange={handleOnChange}
        renderTags={(value) => value.map((option, index) => 
          <Chip
            key={index}
            variant="filled"
            label={option.title}
            sx={{ margin:.25}}
            color={mode ? "white" : "primary"}
            onDelete={() => {
              removeOption(option.title);
            }}
          />)
        }

        getOptionLabel={(option) => {
          // Value selected with enter, right from the input
          if (typeof option === 'string') {
            return option;
          }
          // Add "xxx" option created dynamically
          if (option.inputValue) {
            return option.inputValue;
          }
          // Regular option
          return option.title;
        }}
        renderInput={(params) => (
          mode ? 
            <SearchTextField multiline rows={1} {...params} placeholder="Add Tags" inputProps={{ ...params.inputProps, maxLength: 140}}/> 
          : 
            <NormalTextField multiline {...params} label="Tags" sx={{ maxWidth:{md:"20vw", sm:"40vw"}, minWidth:{md:"10vw", sm:"40vw"} }}  inputProps={{ ...params.inputProps, maxLength: 140}} />    
        )}
      
      />
    </>
  );
}

export default Tags;

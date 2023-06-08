import { useEffect, useState } from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import * as portfolioAPI from "../../api/portfolio.js";

function PortfolioGrid(props) {
  const {
    isImageListUpdated,
    setIsImageListUpdated,
    userId,
    setOpen,
    setTargetImage,
  } = props;
  const [imageList, setImageList] = useState([]);
  const token = localStorage.getItem("user-token");

  useEffect(() => {
    portfolioAPI.getAllPortfolioItems(token, userId).then((data) => {
      setImageList(data.data);
    });
  }, []);

  const getAllImages = async () => {
    await portfolioAPI
      .getAllPortfolioItems(token, userId)
      .then((data) => {
        setImageList(data.data);
      })
      .catch((e) => {
        alert(e.message);
      });
  };

  // Gets all the images
  useEffect(() => {
    (async () => {
      getAllImages();
    })();
  }, []);

  useEffect(() => {
    if (isImageListUpdated) {
      (async () => {
        getAllImages();
        setIsImageListUpdated(false);
      })();
    }
  }, [isImageListUpdated]);

  /* onClick, open dialogue which allows user to read title, desc, tags + edit/delete as necessary */
  let handleImageOnClick = (item) => {
    setTargetImage(item);
    setOpen(true);
  };

  return (
    <>
      <ImageList data-testid="img-list" cols={1} variant="masonry">
        {imageList.map((item) => (
          <ImageListItem key={item.id}>
            <img
              src={`${item.img}?fit=crop&auto=format`}
              srcSet={`${item.img}?fit=crop&auto=format&dpr=2 2x`}
              alt={item.title}
              loading="lazy"
              onClick={() => handleImageOnClick(item)}
            />
          </ImageListItem>
        ))}
      </ImageList>
    </>
  );
}

export default PortfolioGrid;

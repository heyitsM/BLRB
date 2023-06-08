import jsonWebToken from "jsonwebtoken";
import * as dotenv from "dotenv";
import ApiError from "../util/ApiError.js";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

// UNCOMMENT THIS IF NOT RUNNING TESTS
dotenv.config();
import prisma from "../util/db.js";

//UNCOMMENT THIS IF RUNNING TESTS
// const test_url = process.env.DATABASE_TEST_URL;
// const dev_url = process.env.DATABASE_URL;
// process.env.DATABASE_URL = test_url;

// const prisma = new PrismaClient();
const validUuid = z.string().uuid("Invalid uuid!");

export const createToken = ({ user, role, expiresIn }) => {
  return jsonWebToken.sign({id:user, role}, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: expiresIn || "2d",
  });
};

export const decodeToken = (token) => {
  return jsonWebToken.verify(token, process.env.JWT_SECRET, {
    algorithm: "HS256",
    ignoreNotBefore: true,
  });
};

export const checkPermission = async (req, res, next) => {
  const emailRoutes = ['/usercreation', '/requeststarted', '/requestdenied', '/requestaccepted', '/paymentconfirmed', '/paymentcanceled', '/commissioncomplete'];
    try {
      //can only post to users or login if unauthorized
      if (req.method === "POST" && (req.path === '/users' || req.path ===  '/login')) {
        return next();
      }

      const bearerHeader = req.headers["authorization"];
      const bearer = bearerHeader.split(" ");
      const token = bearer[1];
      const { id, role, iat, exp } = decodeToken(token);
      
      let iat_conv = iat * 1000;
      let exp_conv = exp * 1000;
      let now = Date.now();
      
      if (exp_conv < now || iat_conv > now) {
        next(new ApiError(401, "Invalid token"))
      }

      if (role === "ADMIN") {
        return next();
      } else if (id === "" || id === null || id === undefined) {
        return next(new ApiError(403, "Forbidden"));
      } else {
        let result = validUuid.safeParse(id);
        if (!result.success) {
          return next(new ApiError(403, "Forbidden"));
        }
      }
      

      const tokenUser = await prisma.user.findUnique({ //wrong db- on tests, it's checking dev
        where: {
          id: id,
        }, 
        include: {
          portfolio:true,
        }
      });


      if (!tokenUser) {
        next(new ApiError(403, "Forbidden"))
      }
      
      

      //current user has a valid token, can be decoded to a valid id, and that id is a current user
      //if all that is true then they can run get requests
      //figure out how to differentiate between a get by id and a get all
      if (req.method === "GET") {
        return next();
      } else if (req.method === "DELETE") {
        if (req.params.id || req.params.userid) {
          //if deleting user by id, and the id matches, move forward
          if (req.path.includes('/users')||req.path.includes('/recruiterInfos')||req.path.includes('/professionalArtistInfos')) {
            let result = validUuid.safeParse(req.params.id);
            if (!result.success) {
              return next(new ApiError(400, "Invalid id format"));
            }
            const user = await prisma.user.findUnique({
              where: {
                id: req.params.id,
              },
              include: {
                professionalArtistInfo:true,
                recruiterInfo:true,
              }
            });

            if (user && id === req.params.id) {
              if (req.path.includes('/recruiterInfos') && user.recruiterInfo) {
                return next();
              } else if (req.path.includes('/professionalArtistInfos') && user.professionalArtistInfo) {
                return next();
              } else if (req.path.includes('/professionalArtistInfos') || req.path.includes('/recruiterInfos')) {
                return next(new ApiError(404, "Resource not found"));
              } else {
                return next(); //atp it's a user and the ids match
              }
            } else {
              if (!user) {
                return next(new ApiError(404, "User resource not found"));
              } else {
                return next(new ApiError(403, "Forbidden"));
              }
            }

            // req.params.id = id;
            // return next();
            
          } else if (req.path.includes('/profiles')) {
            let result = validUuid.safeParse(req.params.userid);
            if (!result.success) {
              return next(new ApiError(400, "Invalid id format"));
            }

            const user = await prisma.user.findUnique({
              where: {
                id: req.params.id,
              },
              include: {
                profile:true,
              }
            });

            if (user && id === req.params.userid) {
              return next();
            } else if (user) {
              return next(new ApiError(403, "Forbidden"))
            } else {
              return next(new ApiError(404, "Resource not found"));
            }
            // req.params.userid = id;
            // return next();
            
          } else if (req.path.includes('/portfolioItems')) {
            
            const itemId = req.params.id;
            const portfolioId = tokenUser.portfolio.id;
            
            let result = validUuid.safeParse(itemId);
            if (!result.success) {
              return next(new ApiError(400, "Invalid id format"));
            }
            
            //get portfolioId and portfolioItemId, find item with both. If it exists, move on
            
            const portfolioItem = await prisma.portfolioItem.findFirst({
              where: {
                id:itemId,
              },
            });

            if (portfolioItem && portfolioItem.portfolioId === portfolioId) {
              return next();
            } else if (portfolioItem) {
              return next(403, "Forbidden");
            } else {
              return next(404, "Resource not found");
            }
          } else if (req.path.includes('/portfolios')) {
            const portfolioId = req.params.id;
            let result = validUuid.safeParse(req.params.id);
            if (!result.success) {
              return next(new ApiError(400, "Invalid id format"));
            }

            const userPortfolioId = tokenUser.portfolio.id; //if the user's portfolioId matches the id in params, can delete
            if (portfolioId === userPortfolioId) {
              return next();
            } else {
              return next(new ApiError(403, "Forbidden"));
            }
          } else if (req.path.includes('/posts')) { 
            const itemId = req.params.id;
            let result = validUuid.safeParse(itemId);
            if (!result.success) {
              return next(new ApiError(400, "Invalid id format"));
            }

            const post = await prisma.post.findFirst({
              where: { id:itemId }
            });

            if (post && post.userId === id) {
              return next();
            } else if (post) {
              if (req.body["num_likes"] !== "" && req.body["num_likes"] !== undefined) {
                return next();
              } else {
                return next(new ApiError(403, "Forbidden"));
              }
            } else {
              return next(new ApiError(404, "Resource not found"));
            }
          } else if (req.path.includes('/postLikes')) {
            const postLikeId = req.params.id;

            let result = validUuid.safeParse(postLikeId);
            if (!result.success) {
              return next(new ApiError(400, "Invalid id format"));
            }

            const p = await prisma.postLike.findFirst({
              where: {id:postLikeId},
            });

            if (p && id === p.userId) {
              return next();
            } else if (p) {
              return next(new ApiError(403, "Forbidden"));
            } else {
              return next(new ApiError(404, "Resource not found"));
            }
          } else if (req.path.includes('/commissions')) { 
            let commissionId = req.params.id;
            let result = validUuid.safeParse(commissionId);
            if (!result.success) {
              return next(new ApiError(400, "Invalid id format"));
            }

            let commission = await prisma.commission.findFirst({
              where: {
                id: commissionId,
              },
            });

            if (commission && (commission["artist_id"] === id || commission["commissioner_id"] === id)) {
              return next();
            } else if (commission) {
              return next(new ApiError(403, "Forbidden"));
            } else {
              return next(new ApiError(404, "Resource not found"));
            }
          } else if (req.path.includes('/comments')) {
            const itemId = req.params.id;
            let result = validUuid.safeParse(itemId);
            if (!result.success) {
              return next(new ApiError(400, "Invalid id format"));
            }

            const comment = await prisma.comment.findFirst({
              where: { id:itemId }
            });

            if (comment && comment.userId === id) {
              return next();
            } else if (post) {
              return next(new ApiError(403, "Forbidden"));
            } else {
              return next(new ApiError(404, "Resource not found"));
            }
          } else if (req.path.includes('/followings')) {
            const followingId = req.params.id;
            
            let result = validUuid.safeParse(followingId);
            if (!result.success) {
              return next(new ApiError(400, "Invalid id format"));
            }

            let following = await prisma.following.findFirst({
              where: {
                id:followingId,
              },
            });

            if (following && following.follower_id === id) {
              return next();
            } else if (following) {
              return next(403, "Forbidden");
            } else {
              return next(404, "Resource not found");
            }
          }
        } else {
          return next(new ApiError(403, "Forbidden"));
        }
      } else if (req.method === "PUT") {
        //if updating user by id, and the id matches, move forward
        if (req.path.includes('/users')||req.path.includes('/recruiterInfos')||req.path.includes('/professionalArtistInfos')) { //token matching on line 286 tests
          let result = validUuid.safeParse(req.params.id);
          if (!result.success) {
            return next(new ApiError(400, "Invalid id format"));
          }
          const user = await prisma.user.findUnique({
            where: {
              id: req.params.id,
            },
            include: {
              professionalArtistInfo:true,
              recruiterInfo:true,
            }
          });

          if (user && id === req.params.id) {
            if (req.path.includes('/recruiterInfos') && user.recruiterInfo) {
              return next();
            } else if (req.path.includes('professionalArtistInfos') && user.professionalArtistInfo) {
              return next();
            } else if (req.path.includes('/professionalArtistInfos') || req.path.includes('/recruiterInfos')) {
              return next(new ApiError(404, "Resource not found"));
            } else {
              return next(); //atp it's a user and the ids match
            }
          } else {
            if (!user) {
              return next(new ApiError(404, "User resource not found"));
            } else {
              return next(new ApiError(403, "Forbidden"));
            }
          }

        } else if (req.path.includes('/profiles')) { //this one looks good
          // req.params.userid = id;
          let result = validUuid.safeParse(req.params.userid);
          if (!result.success) {
            return next(new ApiError(400, "Invalid id format"));
          }
          
          const user = await prisma.user.findUnique({
            where: {
              id: req.params.userid,
            },
            include: {
              profile:true,
            }
          });
          
          if (user && id === req.params.userid) {
            return next();
          } else if (user) {
            return next(new ApiError(403, "Forbidden"))
          } else {
            return next(new ApiError(404, "Resource not found"));
          }
        } else if (req.path.includes('/portfolioItems')) { //still need to test this idk if it will work
          
          const itemId = req.params.id;
          let result = validUuid.safeParse(req.params.id);
            if (!result.success) {
              return next(new ApiError(400, "Invalid id format"));
          }
          const portfolioId = tokenUser.portfolio.id;
          //get portfolioId and portfolioItemId, find item with both. If it exists, move on
          const portfolioItem = await prisma.portfolioItem.findFirst({
            where: {
              id:itemId,
            },
          });

          if (portfolioItem && portfolioItem.portfolioId === portfolioId) {
            return next();
          } else if (portfolioItem) {
            return next(new ApiError(403, "Forbidden"));
          } else {
            return next(new ApiError(404, "Resource not found"));
          }
        } else if (req.path.includes('/posts')) { //working correctly
          
          const itemId = req.params.id;
          let result = validUuid.safeParse(req.params.id);
            if (!result.success) {
              return next(new ApiError(400, "Invalid id format"));
          }

          const post = await prisma.post.findFirst({
            where: { id:itemId }
          });
          // return next();

          if (req.body["num_likes"] !== "" && req.body["num_likes"] !== undefined) {
            return next();
          }
          if (post && post.userId === id) {
            return next();
          } else if (post) {
            return next(new ApiError(403, "Forbidden"));
          } else {
            return next(new ApiError(404, "Resource not found"));
          }

        } else if (req.path.includes('/commissions')) {
          let commissionId = req.params.id;
          let commission = await prisma.commission.findFirst({
            where: {
              id: commissionId,
            },
          });

          if (commission && (commission.artist_id === id || commission.commissioner_id === id)) {
            return next();
          } else if (commission) {
            return next(new ApiError(403, "Forbidden"));
          } else {
            return next(new ApiError(404, "Resource not found"));
          }
        }
      } else if (req.method === "POST") { //p sure these are all good
        //this is probably where you want to check for the search route in users
        //can create a profile if the id matches the id given to post to
        if (req.path === '/users/search') { //search route is post req because I was lazy early on
          return next();
        } else if (req.path === '/profiles') {
          let result = validUuid.safeParse(req.body["user_id"]);
          if (!result.success) {
            return next(new ApiError(400, "Invalid id format"));
          }

          if (req.body["user_id"] === id) {
            return next();
          } else {
            const user = await prisma.user.findUnique({
              where: {
                id: req.params.id,
              },
            });

            if (user) {
              return next(new ApiError(403, "Forbidden"));
            } else {
              return next(new ApiError(404, "Resource not found"));
            }

            
          }
          // req.body["user_id"] = id;
          // return next();
        } else if (req.path ==='/recruiterInfos'||req.path === '/professionalArtistInfos') { //somehow getting a 401 here
          if (req.body["id"] === id) {
            return next();
          } else {
            let result = validUuid.safeParse(req.body["id"]);
            if (!result.success) {
              return next(new ApiError(400, "Invalid id format"));
            }

            
            const us = await prisma.user.findFirst({
              where: {
                id:req.body["id"]
              }
            });

            if (us) {
              return next(new ApiError(403, "Forbidden"));
            } else {
              return next(new ApiError(404, "User resource not found"))
            }
            
          }
          // req.body["id"] = id;
          // return next();
        } else if (req.path.includes('/payments')) {
          // TODO: do this
          return next();
        } else if (emailRoutes.includes(req.path)) { //functions with valid token
            return next();
        } else if (req.path === '/portfolioItems' || req.path === '/portfolios' || req.path === '/posts' || req.path === '/postLikes' || req.path === '/comments') {//  functions with valid token
          if (req.body["userId"] === id) {
             return next();
          } else {
            let result = validUuid.safeParse(req.body["userId"]);
            if (!result.success) {
              return next(new ApiError(400, "Invalid id format"));
            }

            let user = await prisma.user.findFirst({
              where: {id:req.body["userId"]}
            });

            if (!user) {
              return next(new ApiError(404, "Resource not found"));
            } else {
              return next(new ApiError(403, "Forbidden"))
            }
          }
          
          
        } else if (req.path === '/commissions') {
          if (req.body["artist_id"] === id || req.body["commissioner_id"] === id) {
            return next();
          } else {
            if (req.body["artist_id"] && req.body["commissioner_id"]) {
              return next(new ApiError(403, "Forbidden"));
            } else if (req.body["artist_id"]) {
              return next(new ApiError(404, "Invalid commissioner_id"));
            } else if (req.body["commissioner_id"]) {
              return next(new ApiError(404, "Invalid artist_id"));
            } else {
              return next(new ApiError(404, "Invalid artist_id and commissioner_id"));
            }
          }
        } else if (req.path.includes('/followings')) {
          let follower_id = req.body["follower_id"];
          let result = validUuid.safeParse(follower_id);
          if (!result.success) {
            return next(new ApiError(400, "Invalid id format"));
          }

          if (id === follower_id) {
            return next();
          }

          let user = await prisma.user.findFirst({
            where: {id:follower_id}
          });

          if (!user) {
            return next(new ApiError(404, "Resource not found"));
          } else {
            return next(new ApiError(403, "Forbidden"))
          }

        }
      }
  
      next(new ApiError(403, "Forbidden"));
    } catch (err) {
      if (err.status === 500) {
        next(err);
      }
      next(new ApiError(401, "Unauthorized"));
    }
};
  
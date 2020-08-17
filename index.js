/* check-loopback-access-token - middleware to check for a valid loopback accessToken
 *
 * Copyright (c) 2020 Luc Deschenaux
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */   

module.exports=function(app, options) {
  return function checkAccessToken(req, res, next){
    if (!req.accessToken) app.models.AccessToken.findForRequest(req,function(err,token){
      if (err) {
        console.log(err);
      } 
      req.accessToken=token || null;
      if (!err && req.accessToken) {
        if (options&&options.debug) console.log('ACCESS_TOKEN',req.accessToken);
        next();
      } else {
        if (options&&options.action) {
          options.action(req,res,next)
        } else {
          var err2;
          try {
            if (req.accepts('text/html')) {
              res.redirect('/login');
              if (options&&options.debug) console.log('unauthorized: redirect to login ('+req.originalUrl+')');
            } else {
              res.status(401).end('unauthorized');
              if (options&&options.debug) console.log('unauthorized ('+req.originalUrl+')');
            }
          } catch(e) {
            console.log(e);
            err2=e;
          }
          if (err2) {
            try {
              if (options&&options.debug) console.log('unauthorized: destroy ('+req.originalUrl+')');
              res.socket.destroy();
            } catch(e) {
              console.log(e);
            }
          }
          next(err||new Error('unauthorized'));
        }
      }
    });
  }
}                                                                                                                                                                                                                  

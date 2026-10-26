const db = require('../../config/connection');

const Datastore = require('@seald-io/nedb');
const he = require('he')
productlinks = new Datastore({filename: 'productlinks.db', autoload: true });

const rp = require('../middleware/fetch_html');
const cheerio = require('cheerio');
const url = 'https://www.coop.nl/boodschappen';
var re = "PageSize=24"; 

const util = require('util')
const setTimeoutPromise = util.promisify(setTimeout)


module.exports = (req, res) => {
	
	var interval = 500;
		productlinks.find({}, function (err, docs){
			var doclength = docs.length
			for(x = 0; x < doclength; x++){				
			//for(x = 0; x < 10; x++){
				var url1 = docs[x].url
				setTimeoutPromise(interval * x, url1).then((value) => {
					rp(value)
						.then(function(html){
							const $ = cheerio.load(html);

							var length = $('.crumbs li a span').length;
							var	url2= value
							var	title= $('.crumbs li a span')[length -1].children[0].data
							var	categoryname1= $('.crumbs li a span')[2].children[0].data
							var	categoryname2= $('.crumbs li a span')[3].children[0].data
							var	imgurl= (($('article picture img')[0].attribs['data-srcset']).match(/^(\S+)\s(.*)/).slice(1)[0])
							var	itemtype= $('article ').parent()[0].attribs.itemtype
							var	price= JSON.parse($('article ').parent()[0].attribs['data-product'])['price']
							var	variant= JSON.parse($('article ').parent()[0].attribs['data-product'])['variant']
							var	ean= JSON.parse($('article ').parent()[0].attribs['data-product'])['id']
							var	dataproduct= $('article ').parent()[0].attribs['data-product']
							var	datasyndyproductid= $('.syndy-nutrients')[0].attribs['data-syndy-productid']
							var	datasyndyfont= $('.syndy-nutrients')[0].attribs['data-syndy-font']
							var	datasyndyculturedid= $('.syndy-nutrients')[0].attribs['data-syndy-culturedid']
							var	schaphoogte= getRandomInt(5)
							var	schapplaats= getRandomInt(30)
							
							var slug = ($('.crumbs li a span')[2].children[0].data).replace(/\s+/g, '-').toLowerCase() + '/' + ($('.crumbs li a span')[3].children[0].data).replace(/\s+/g, '-').toLowerCase();


							var sqlquery = "INSERT INTO `cooplubbers`.`Product` "
								sqlquery += "(`url`, `title`, `categoryname1`,	`categoryname2`, `imgurl`, `itemtype`, `price`, `variant`, `ean`, `dataproduct`, "
								sqlquery += "`datasyndyproductid`, `discountPrice`, `datasyndyfont`, `schaphoogte`, `schapplaats`) "
								sqlquery += "VALUES("+ db.connection.escape(url2) +","+ db.connection.escape(title) +", "+ db.connection.escape(categoryname1) +", "+ db.connection.escape(categoryname2) +", "+ db.connection.escape(imgurl) +", "+ db.connection.escape(itemtype) +", "+ db.connection.escape(price) +", "+ db.connection.escape(variant) +", "+ db.connection.escape(ean) +", "+ db.connection.escape(dataproduct) +", "
								sqlquery += db.connection.escape(datasyndyproductid) +", 0.00, "+ db.connection.escape(datasyndyfont) +", "+ db.connection.escape(schaphoogte) +", "+ db.connection.escape(schapplaats) +"); "
						
								db.connection.query(sqlquery, function (err, result){
								if(err) throw err;
							
								const message = "Done ripping from website"
							})  
						})		
					  .catch(function(err){
						//handle error
					  });
					
				});
			}
		})
			const message = "Done ripping from website"
			res.status(200).json({message});	
	/*	rp(url)
		  .then(function(html){
			//success!
			
			var catSize = $('.main .categoryItem > a ').length;
			for (let i = 0; i < catSize; i++) {
		//	for (let i = 0; i < 2; i++) {
				

				rp($('.main .categoryItem > a ')[i].attribs.href)
				  .then(function(html){
					//success!
					var catHref = ($('.pagination__listItem > a')[1].attribs.href).replace(re, "PageSize=1700");
					
						rp(catHref)
						.then(function(html){
							//success!
							const catlength = $('article header h2').length;
							//for(let j = 0; j < $('article header h2').length; j++){
							for(let j = 0; j < catlength; j++){
									setTimeout( function (i) {
										hrefs = $('article > .formfields > a')[j].attribs.href;

											const doc = { 	
												url: hrefs
											}

										productlinks.insert(doc, function (err, newDoc) { 	// Callback is optional
										});
									}, interval * i * j, i * j);
								}
							})
						  .catch(function(err){
							//handle error
						  });
					})
				  .catch(function(err){
					//handle error
				  });

			}
		  })
		  .catch(function(err){
			//handle error
		  });
	*/
	
		
   /*
		var sqlquery = "INSERT INTO `cooplubbers`.`Product` "
		sqlquery += "(`url`, `title`, `categoryname1`,	`categoryname2`, `imgurl`, `itemtype`, `price`, `variant`, `ean`, `dataproduct`, "
		sqlquery += "`datasyndyproductid`, `discountPrice`, `datasyndyfont`, `schaphoogte`, `schapplaats`) "
		sqlquery += "VALUES(<{url: }>,	<{title: }>, <{categoryname1: }>, <{categoryname2: }>, <{imgurl: }>, <{itemtype: }>, <{price: }>, <{variant: }>, <{ean: }>,	<{dataproduct: }>, "
		sqlquery += "<{datasyndyproductid: }>, <{discountPrice: 0.00}>, <{datasyndyfont: }>,	<{schaphoogte: }>,	<{schapplaats: }>); "
	
	
		db.connection.query(sqlquery, function (err, result){
		if(err) throw err;
		const message = result;*/
	//	const message = "Done ripping from website"
     //   res.status(200).json({message});
//	})   
};

/*
router.get('/api/coopextra', (req, res) => {
		
		productlinks.find({}, function (err, docs){
			//for(x = 0; x < docs.length; x++){				
			for(x = 0; x < 1700; x++){
				searchProduct(docs[x].url);
			}
		});
});

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


const  searchProduct  = (url, cb) => {
	rp(url)
		.then(function(html){
				
			var length = $('.crumbs li a span').length;		
			const doc = { 	
				url: url,
				title: $('.crumbs li a span')[length -1].children[0].data,
				categoryname1: $('.crumbs li a span')[2].children[0].data,
				categoryname2: $('.crumbs li a span')[3].children[0].data,
				imgurl: (($('article picture img')[0].attribs['data-srcset']).match(/^(\S+)\s(.*)/).slice(1)[0]),
				itemtype: $('article ').parent()[0].attribs.itemtype,
				price: JSON.parse($('article ').parent()[0].attribs['data-product'])['price'],
				variant: JSON.parse($('article ').parent()[0].attribs['data-product'])['variant'],
				ean: JSON.parse($('article ').parent()[0].attribs['data-product'])['id'],
				dataproduct: $('article ').parent()[0].attribs['data-product'],
				datasyndyproductid: $('.syndy-nutrients')[0].attribs['data-syndy-productid'],
				datasyndyfont: $('.syndy-nutrients')[0].attribs['data-syndy-font'],
				datasyndyculturedid: $('.syndy-nutrients')[0].attribs['data-syndy-culturedid'],
				schaphoogte: getRandomInt(5),
				schapplaats: getRandomInt(30)
			}
			
			var slug = ($('.crumbs li a span')[2].children[0].data).replace(/\s+/g, '-').toLowerCase() + '/' + ($('.crumbs li a span')[3].children[0].data).replace(/\s+/g, '-').toLowerCase();
			coopdepartmentsdb.ensureIndex({ fieldName: 'slug', unique: true }, function (err) {
			});
			coopdepartmentsdb.findOne({slug: slug}, function (err, docs1){
				if(docs1 == null){
					const doc1 = { 	
						mainlabel: ($('.crumbs li a span')[2].children[0].data),
						sec_label: ($('.crumbs li a span')[3].children[0].data),
						slug: slug
					}
					coopdepartmentsdb.insert(doc1, function (err, newDoc) { 	// Callback is optional
					});
				}
			})
			coopproductdb.insert(doc, function (err, newDoc) { 	// Callback is optional
				
			});
		})		
	  .catch(function(err){
		//handle error
	  });
}*/


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


function searchProduct (url){
	rp(url)
		.then(function(html){
			const $ = cheerio.load(html);
				
			var length = $('.crumbs li a span').length;		
			const doc = { 	
				url: url,
				title: he.encode($('.crumbs li a span')[length -1].children[0].data),
				categoryname1: he.encode($('.crumbs li a span')[2].children[0].data),
				categoryname2: he.encode($('.crumbs li a span')[3].children[0].data),
				imgurl: he.encode((($('article picture img')[0].attribs['data-srcset']).match(/^(\S+)\s(.*)/).slice(1)[0])),
				itemtype: he.encode($('article ').parent()[0].attribs.itemtype),
				price: JSON.parse($('article ').parent()[0].attribs['data-product'])['price'],
				variant: he.encode(JSON.parse($('article ').parent()[0].attribs['data-product'])['variant']),
				ean: JSON.parse($('article ').parent()[0].attribs['data-product'])['id'],
				dataproduct: he.encode($('article ').parent()[0].attribs['data-product']),
				datasyndyproductid: he.encode($('.syndy-nutrients')[0].attribs['data-syndy-productid']),
				datasyndyfont: he.encode($('.syndy-nutrients')[0].attribs['data-syndy-font']),
				datasyndyculturedid: he.encode($('.syndy-nutrients')[0].attribs['data-syndy-culturedid']),
				schaphoogte: getRandomInt(5),
				schapplaats: getRandomInt(30)
			}
			
			var slug = ($('.crumbs li a span')[2].children[0].data).replace(/\s+/g, '-').toLowerCase() + '/' + ($('.crumbs li a span')[3].children[0].data).replace(/\s+/g, '-').toLowerCase();
		
		
			var sqlquery = "INSERT INTO `cooplubbers`.`Product` "
				sqlquery += "(`url`, `title`, `categoryname1`,	`categoryname2`, `imgurl`, `itemtype`, `price`, `variant`, `ean`, `dataproduct`, "
				sqlquery += "`datasyndyproductid`, `discountPrice`, `datasyndyfont`, `schaphoogte`, `schapplaats`) "
				sqlquery += "VALUES('"+ doc.url +"','"+ doc.title +"', '"+ doc.categoryname1 +"', '"+ doc.categoryname2 +"', '"+ doc.imgurl +"', '"+ doc.itemtype +"', '"+ doc.price +"', '"+ doc.variant +"', '"+ doc.ean +"',	'"+ doc.dataproduct +"', "
				sqlquery += "'"+ doc.datasyndyproductid +"', 0.00 , '"+ doc.datasyndyfont +"', "+ doc.schaphoogte +", "+ doc.schapplaats +"); "

				db.connection.query(sqlquery, function (err, result){
				if(err) throw err;
				const message = "Done ripping from website"
			})  
		})		
	  .catch(function(err){
		//handle error
	  });
}
// Ported from Server/config/mailing.js: the HTML bodies of the e-mails (HTML kept as it was, including the escaping of
// customer text added in REV-014).
/* eslint-disable prefer-const -- ported HTML builders: declared first, assigned below, as in the old code */
import * as he from 'he';
import * as templates from './templates';
import type { ActieOrderMailInfo, OrderMailInfo, ReminderMailInfo } from './mail.types';

// template values come from customers and the database: never insert them as raw HTML
const escapeHtml = (value: unknown): string => he.escape(String(value ?? ''));

export const pickedTemplate = (mystr: string, orderInfo: OrderMailInfo): string => {
  let html: string;
  let producten = '';
		producten = '<table>'
		orderInfo.product_list.forEach((slide) => {
			producten += `
				<tr>
					<td>
						${escapeHtml(slide.product.product_information.title)} ${escapeHtml(slide.product.product_information.variant)} 
					</td>
					<td>
						${slide.picked} X
					</td>
				</tr>`
		})

		html = `
			${templates.header()}
			${templates.top('Coop Lubbers')}
			${templates.mailName('Bestelling verwerkt')}
			${templates.divider()}
			<div style="color:#393d47;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
				<div class="txtTinyMce-wrapper" style="font-size: 14px; line-height: 1.2; color: #393d47; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
		   			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
						Via de onderstaande link kunt u uw bestelling betalen en vervolgens ophalen vanaf uw gekozen tijd. ${escapeHtml(orderInfo.pickupTime)}
					</p>
		   			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
						&nbsp;
					</p>
		   			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
						<a href="${process.env.BASE_URL}paypage/${escapeHtml(mystr)}">
							${process.env.BASE_URL}paypage/${escapeHtml(mystr)}
						</a>
					</p>
		   			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
						<br>
						Laat tijdens het afhalen van uw bestelling de QR code in deze mail scannen.
					</p>
				</div>
	 		</div>
	 		<div class="img-container center autowidth" align="center" style="padding-right: 0px;padding-left: 0px;"><img class="center autowidth" align="center" border="0" src="cid:qrcode@cooplubbers.nl" alt="QRcode" title="QRcode" style="border-color: red; width: 99%; background-color: white; text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; width: 260px; max-width: 100%; display: block;" width="260"></div>
	 			<table class="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" role="presentation" valign="top">
					<tbody>
		   				<tr style="vertical-align: top;" valign="top">
			  				<td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;" valign="top">
				 				<table class="divider_content" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 1px solid #BBBBBB; width: 100%;" align="center" role="presentation" valign="top">
									<tbody>
					   					<tr style="vertical-align: top;" valign="top">
						  					<td style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top"><span></span></td>
					   					</tr>
									</tbody>
								</table>
							</td>
						</tr>
					</tbody>
	 			</table>
	 			<div style="color:#393d47;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
					<div class="txtTinyMce-wrapper" style="font-size: 14px; line-height: 1.2; color: #393d47; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
		   				<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
							Uw bestelling is ingepakt, deze bestelling bevat de volgende producten:
						</p>
					</div>
	 			</div>
	 			<div style="font-size:16px;text-align:center;font-family:Arial, Helvetica Neue, Helvetica, sans-serif">
	 				<table>
	 					<tbody>
				 			${producten}
							<tr>
								<td>
									<p>Bedrag: € ${orderInfo.finalPrice}</p>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
			${templates.footer()}
		`
		return html
}

export const orderedTemplate = (orderInfo: OrderMailInfo): string => {
  let html: string;
  let producten = '';
	producten = '<table>'
	orderInfo.product_list.forEach((slide) => {
			producten += `
			<tr>
				<td>
					${escapeHtml(slide.product.product_information.title)} ${escapeHtml(slide.product.product_information.variant)} `
					if(slide.actie_order_product_variant_list){					
						if(slide.actie_order_product_variant_list.length > 0){
							for(let i = 0; i < slide.actie_order_product_variant_list.length; i++){
								producten += `${escapeHtml(slide.actie_order_product_variant_list[i].product_variant.variant_label)} `
							}
						}
					}
		producten +=`</td>
				<td>
					${slide.amount} X
				</td>
			</tr>`
	})
	html = `
		${templates.header()}
		${templates.top('Coop Lubbers')}
		${templates.mailName('Bestelling geplaatst')}
		${templates.divider()}
		<div style="color:#393d47;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;adding-right:10px;padding-bottom:10px;padding-left:10px;">
			<div class="txtTinyMce-wrapper" style="font-size: 14px; line-height: 1.2; color: #393d47; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
				<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
					Uw bestelling is verwerkt en wordt voor u verzameld voor de gekozen afhaaltijd.<br>
					Wanneer deze verpakt is, krijgt u een vervolg mail met een link en code om de tweede betaling af te ronden.<br>
					Wanneer een product niet voorraadig blijkt te zijn, wordt deze niet opgenomen in de bestelling.<br>
					Aanbiedingen worden automatisch verrekend tijdens het inpakproces.
				</p>
			</div>
		</div>
		<div style="color:#393d47;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
			<div class="txtTinyMce-wrapper" style="font-size: 14px; line-height: 1.2; color: #393d47; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
				<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
					Uw bestelling is ingepakt, deze bestelling bevat de volgende producten:
				</p>
			</div>
		</div>
		<div style="font-size:16px;text-align:center;font-family:Arial, Helvetica Neue, Helvetica, sans-serif">
			<table>
				<tbody>
					${producten}
					<tr>
						<td>`
							if(!orderInfo.product_list[0].actie_order_product_variant_list){		
								html += `<p>Bedrag: € ${orderInfo.finalPrice}</p>`
							}
						// the old Server forgot the `html +=` here: the closing tags and the footer of this mail were dropped
						html += `</td>
					</tr>
				</tbody>
			</table>
		</div>
		${templates.footer()}
	`
	return html
}

export const actiePickedTemplate = (mystr: string, orderInfo: ActieOrderMailInfo): string => {
  let html: string;
  let producten = '';
	producten = '<table border="1px" cellspacing="2px" width="100%" align="left">'
	orderInfo.product_list.forEach((slide) => {
			producten += `
			<tr>
				<td>
					${escapeHtml(slide.product.product_information.title)} ${escapeHtml(slide.product.product_information.variant)} `				
					if(slide.actie_order_product_variant_list.length > 0){
						for(let i = 0; i < slide.actie_order_product_variant_list.length; i++){
							producten += `${escapeHtml(slide.actie_order_product_variant_list[i].product_variant.variant_label)} `
						}
					}
		producten +=`</td>
				<td>
					${slide.amount} X
				</td>
			</tr>`
	})

		html = `
			${templates.header()}
			${templates.top('Coop Lubbers')}
			${templates.mailName('Bestelling geplaatst')}
			${templates.divider()}
			<div style="color:#393d47;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
				<div class="txtTinyMce-wrapper" style="font-size: 14px; line-height: 1.2; color: #393d47; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
		   			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
						Uw bestelling is verwerkt en kan opgehaald worden.
						<br>
						Laat tijdens het afhalen van uw bestelling de QR code in deze mail scannen.
					</p>
				</div>
	 		</div>
	 		<div class="img-container center autowidth" align="center" style="padding-right: 0px;padding-left: 0px;"><img class="center autowidth" align="center" border="0" src="cid:qrcode@cooplubbers.nl" alt="QRcode" title="QRcode" style="border-color: red; width: 99%; background-color: white; text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; width: 260px; max-width: 100%; display: block;" width="260"></div>
	 			<table class="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" role="presentation" valign="top">
					<tbody>
		   				<tr style="vertical-align: top;" valign="top">
			  				<td class="divider_inner" style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;" valign="top">
				 				<table class="divider_content" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 1px solid #BBBBBB; width: 100%;" align="center" role="presentation" valign="top">
									<tbody>
					   					<tr style="vertical-align: top;" valign="top">
						  					<td style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;" valign="top"><span></span></td>
					   					</tr>
									</tbody>
								</table>
							</td>
						</tr>
					</tbody>
	 			</table>
	 			<div style="color:#393d47;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
					<div class="txtTinyMce-wrapper" style="font-size: 14px; line-height: 1.2; color: #393d47; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
		   				<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
							Uw bestelling is ingepakt, deze bestelling bevat de volgende producten:
						</p>
					</div>
	 			</div>
	 			<div style="font-size:16px;text-align:center;font-family:Arial, Helvetica Neue, Helvetica, sans-serif">
	 				<table>
	 					<tbody>
				 			${producten}
						</tbody>
					</table>
				</div>
			</div>
			${templates.footer()}
		`
		return html
}

export const orderedActieTemplate = (orderInfo: ActieOrderMailInfo): string => {
  let html: string;
  let producten = '';
	producten = '<table border="1px" cellspacing="2px" width="100%" align="left">'
	orderInfo.product_list.forEach((slide) => {
			producten += `
			<tr>
				<td>
					${escapeHtml(slide.product.product_information.title)} ${escapeHtml(slide.product.product_information.variant)} `				
					if(slide.actie_order_product_variant_list.length > 0){
						for(let i = 0; i < slide.actie_order_product_variant_list.length; i++){
							producten += `${escapeHtml(slide.actie_order_product_variant_list[i].product_variant.variant_label)} `
						}
					}
		producten +=`</td>
				<td>
					${slide.amount} X
				</td>
			</tr>`
	})
	html = `
		${templates.header()}
		${templates.top('Coop Lubbers')}
		${templates.mailName('Spaaractie bestelling geplaatst')}
		${templates.divider()}
		<div style="
			color:#393d47;
			font-family:Arial, Helvetica Neue, Helvetica, sans-serif;
			line-height:1.2;
			padding-top:10px;
			padding-right:10px;
			padding-bottom:10px;
			padding-left:10px;">
			<div class="txtTinyMce-wrapper" 
				style="font-size: 14px; 
				line-height: 1.2; 
				color: #393d47; 
				font-family: Arial, Helvetica Neue, Helvetica, sans-serif; 
				mso-line-height-alt: 17px;">
				<p style="margin: 0; 
					font-size: 14px; 
					line-height: 1.2; 
					word-break: break-word; 
					mso-line-height-alt: 17px; 
					margin-top: 0; 
					margin-bottom: 0;">
					Uw bestelling is verwerkt en wordt voor u verzameld.<br>
					Wanneer deze verpakt is, krijgt u een vervolg mail met een code om uw bestelling af te halen.<br>
					Wanneer een product niet voorraadig blijkt te zijn, wordt deze niet opgenomen in de bestellig.<br>
					Aanbiedingen worden automatisch verrekend tijdens het inpakproces.
				</p>
			</div>
		</div>
		<div style="color:#393d47;
		font-family:Arial, Helvetica Neue, Helvetica, sans-serif;
		line-height:1.2;
		padding-top:10px;
		padding-right:10px;
		padding-bottom:10px;
		padding-left:10px;">
			<div class="txtTinyMce-wrapper" 
				style="font-size: 14px; 
				line-height: 1.2; 
				color: #393d47; 
				font-family: Arial, Helvetica Neue, Helvetica, sans-serif; 
				mso-line-height-alt: 17px;">
				<p style="margin: 0; 
					font-size: 14px; 
					line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
					Uw bestelling wordt verzameld, deze bestelling bevat de volgende producten:
				</p>
			</div>
		</div>
		<div style="font-size:16px;text-align:center;font-family:Arial, Helvetica Neue, Helvetica, sans-serif">
			<table>
				<tbody>
					${producten}
				</tbody>
			</table>
		</div>
		${templates.footer()}
	`
	return html
}

export const orderedDonarTemplate = (orderInfo: ActieOrderMailInfo): string => {
  let html: string;
  let producten = '';

	producten = '<table border="1px" cellspacing="2px" width="100%" align="left">'
	orderInfo.product_list.forEach((slide) => {
		if(slide.product_id != 28898){
			producten += `
			<tr>
				<td style="padding: 3px">
					${escapeHtml(slide.product.product_information.title)} ${escapeHtml(slide.product.product_information.variant)} `				
					if(slide.actie_order_product_variant_list.length > 0){
						for(let i = 0; i < slide.actie_order_product_variant_list.length; i++){
							producten += `${escapeHtml(slide.actie_order_product_variant_list[i].product_variant.variant_label)} `
						}
					}
		producten +=`</td>
				<td style="padding: 3px">
					${slide.amount} X
				</td>
			</tr>`
		}		
	})

	html = `
		${templates.header()}
		${templates.top('Coop Lubbers Actie Bestelling')}
		${templates.mailName('Spaaractie bestelling geplaatst')}
		${templates.divider()}
		<div style="color:#393d47;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;adding-right:10px;padding-bottom:10px;padding-left:10px;">
			<div class="txtTinyMce-wrapper" style="font-size: 14px; line-height: 1.2; color: #393d47; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
				<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
					Klantgegevens:<br>
					Naam: ${escapeHtml(orderInfo.actie_order_information.first_name)} ${escapeHtml(orderInfo.actie_order_information.surname)}<br>
					Email: ${escapeHtml(orderInfo.actie_order_information.customerEmail)}<br>
					`
					if(orderInfo.delivery === true){
						html += `
						Adres: ${escapeHtml((orderInfo.actie_order_information.street || ''))} ${escapeHtml((orderInfo.actie_order_information.house_number || ''))} ${escapeHtml((orderInfo.actie_order_information.house_addition || ''))}<br>
							${escapeHtml((orderInfo.actie_order_information.zipcode || ''))} ${escapeHtml((orderInfo.actie_order_information.city || ''))}<br>
						`
					}
					html +=`<br>
					Besteld op: ${orderInfo.actie_order_information.createdAt.split('T')[0]}
				</p>
			</div>
		</div>
		<div style="color:#393d47;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
			<div class="txtTinyMce-wrapper" style="font-size: 14px; line-height: 1.2; color: #393d47; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
				<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
					Er is een Donar bestelling gedaan, deze bestelling bevat de volgende producten:
				</p>
			</div>
		</div>
		<div style="font-size:16px;text-align:center;font-family:Arial, Helvetica Neue, Helvetica, sans-serif">
			<table>
				<tbody>
					${producten}
					<tr>
						<td>
							
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		${templates.footer()}
	`
		//html += producten
		//html += `<tr style="width: 100%;"><td style="width:30%;"></td><td style="width: 40%;">\
		//<p>Bedrag: ${orderInfo.totalPrice}</p></td><td style="width:30%;"></td></tr>\
		//</table>`
		
		return html
}

export const accountCreatedTemplate = (): string => {
  let html: string;

	html = `
		${templates.header()}
		${templates.top('Coop Lubbers')}
		${templates.mailName('Account aangemaakt')}
		${templates.divider()}
		<div style="color:#393d47;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
			<div class="txtTinyMce-wrapper" style="font-size: 14px; line-height: 1.2; color: #393d47; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
				<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">Bedankt voor het aanmaken van een account bij de webwinkel van Coop Lubbers
				</p>
			</div>
		</div>		
		${templates.footer()}
	`
	//	nog toevoegen				<br>Voor bevestiging van het account en gebruik te maken van de acties gekoppeld aan de applicatie dient u uw account te bevestigen met de onderstaande link.
	//<br>Als u uw account nog niet had bevestigd, maar wel uw klantenkaart (QR Code) uit de app heeft laten scannen, worden de punten automatisch bijgeschreven
	return html
}

export const accountForgetTemplate = (resetcode: string): string => {
  let html: string;

	html = `	
		${templates.header()}
		${templates.top('Coop Lubbers')}
		${templates.mailName('Wachtwoord vergeten')}
		${templates.divider()}
		<div style="color:#393d47;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
			<div class="txtTinyMce-wrapper" style="font-size: 14px; line-height: 1.2; color: #393d47; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
				<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
					Problemen met inloggen?<br>
					Uw wachtwoord wijzigen is simpel.<br>
					Klik op de onderstaande knop en volg de instructies.<br/>
					<a href="${process.env.BASE_URL}resetpassword?resetcode=${escapeHtml(resetcode)}">
						<button class="button">Wachtwoord wijzigen</button>
					</a><br>
					Kunt u niet op de knop drukken, kunt u ook deze link gebruiken:<br>
					<a href="${process.env.BASE_URL}resetpassword?resetcode=${escapeHtml(resetcode)}">${process.env.BASE_URL}resetpassword?resetcode=${escapeHtml(resetcode)}</a>
					Als u deze wijziging niet heeft aangevraagd, kunt u deze email negeren.
				</p>
			</div>
		</div>											
		${templates.footer()}
	`
	
	return html
}

export const feedbackTemplate = (resetcode: string): string => {
  let html: string;

	html = `	
		${templates.header()}
		${templates.top('Coop Lubbers')}
		${templates.mailName('Feeback')}
		${templates.divider()}
		<div style="color:#393d47;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
			<div class="txtTinyMce-wrapper" style="font-size: 14px; line-height: 1.2; color: #393d47; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
				<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
					Feedback<br>
					${escapeHtml(resetcode)}
				</p>
			</div>
		</div>											
		${templates.footer()}
	`
	
	return html
}

export const actieReminderTemplate = (info: ReminderMailInfo): string => {
  let html: string;
	console.log(info)

	html = `
		${templates.header()}
		${templates.top('Coop Lubbers')}
		${templates.mailName('Coop Lubbers Donar spaaractie!')}
		<table width="100%" border="0" cellspacing="0" cellpadding="0">
			<tr>
				<td align="center">
					<img src="cid:donar_zegel@cooplubbers.nl" style="max-width: 300px; height: auto; margin-left: auto; margin-right: auto;" alt="donar_zegel">
				</td>
			</tr>
		</table>
		${templates.divider()}
		<div style="color:#393d47;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
			<div class="txtTinyMce-wrapper" style="font-size: 14px; line-height: 1.2; color: #393d47; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			Beste Coop Lubbers klant,</p><br/>
			<br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			Wij hebben fantastisch nieuws voor alle Donar fans! 
			Coop Lubbers de spectaculaire Donar merchandise en tickets spaaractie update:</p><br/>
			<br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			Ontdek de opwindende wereld van Basketball club Donar Groningen en 
			spaar GRATIS geweldige fan artikelen uit onze fanshop, evenals tickets voor opwindende wedstrijden!</p><br/>
			<br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			Begin met sparen of wissel je zegels in op onze spaaractie pagina <a href="https://www.cooplubbers.nl/spaaracties">https://www.cooplubbers.nl/spaaracties</a>. 
			En weet je wat het nog beter maakt? 
			Je kunt je Coop Lubbers munten inwisselen voor extra zegels, 
			zodat je nog sneller kunt sparen en de meest geweldige artikelen binnen handbereik liggen.</p><br/>
			<br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			Hier is een overzicht van je huidige aantal zegels:</p><br/>
			<br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			Aantal zegels:<b>${info.spaaractie_list[0].stamp_amount}</b></p><br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			Aantal munten:<b>${info.storepoints}</b></p><br/>
			<br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			Bestel nu direct via: <a href="https://www.cooplubbers.nl/actieshop/donar">https://www.cooplubbers.nl/actieshop/donar</a></p><br/>
			<br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			Ontdek een scala aan maar liefst 20 fantastische fanartikelen, 
			waaronder basketballen, caps, shirts, badhanddoeken, bobbleheads en nog veel meer. 
			Maar wees er snel bij, want het is zolang de voorraad strekt.</p><br/>
			<br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			Als kers op de taart bieden wij je de kans om GRATIS naar een van de wedstrijden van Donar in Martiniplaza te gaan. 
			Een onvergetelijke belevenis voor het hele gezin, 
			waarbij je volledig wordt ondergedompeld in de wereld van Basketball. 
			Mis deze spannende en leuke ervaring absoluut niet!</p><br/>
			<br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			En er is meer goed nieuws: je kunt nog steeds blijven sparen en inwisselen! 
			Let op, voor deze actie gelden actievoorwaarden. 
			Je vindt ze hieronder bij de Donar spaaracties: <a href="https://www.cooplubbers.nl/spaaracties">https://www.cooplubbers.nl/spaaracties</a></p><br/>
			<br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			Je ontvangt deze e-mail omdat je deelnemer bent aan de Donar spaaractie van Coop Lubbers. 
			Wil je liever geen e-mails meer ontvangen? Meld je dan af via een reply.</p><br/>
			<br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			We hopen je snel te zien bij Coop Lubbers, waar we samen met jou de passie voor Donar Basketball vieren!</p><br/>
			<br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			Met vriendelijke groet,</p><br/>
			<p style="margin: 0; font-size: 14px; line-height: 1.2; word-break: break-word; mso-line-height-alt: 17px; margin-top: 0; margin-bottom: 0;">
			Het Coop Lubbers Team</p>
			</div>			
			<img src="cid:storefront@cooplubbers.nl" style="width: 100%; height: auto;" alt="storefront">
		</div>		
		${templates.footer()}
	`
	//	nog toevoegen				<br>Voor bevestiging van het account en gebruik te maken van de acties gekoppeld aan de applicatie dient u uw account te bevestigen met de onderstaande link.
	//<br>Als u uw account nog niet had bevestigd, maar wel uw klantenkaart (QR Code) uit de app heeft laten scannen, worden de punten automatisch bijgeschreven
	return html
}


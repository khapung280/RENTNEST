import { Search, Calculator, Shield, Heart, Target, Users, Home, Star, CheckCircle, TrendingUp, MapPin, Mail, Phone, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const About = () => {
  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Smart Search',
      description: 'Find your perfect property with advanced filters and location-based search across Nepal',
    },
    {
      icon: <Calculator className="w-6 h-6" />,
      title: 'FairFlex Pricing',
      description: 'Transparent pricing with discounts for longer stays. Save up to 10% on 6-month rentals',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Verified Properties',
      description: 'Every listing is manually reviewed and verified for your safety and peace of mind',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Rent Confidence Score',
      description: 'Our unique scoring system helps you make informed decisions with confidence',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Compare Properties',
      description: 'Side-by-side comparison of up to 3 properties to find your best match',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Human-Centered Design',
      description: 'Built with empathy and understanding of what renters really need',
    },
  ]

  const values = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Transparency',
      description: 'Clear and honest pricing with no hidden fees. What you see is what you pay',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Flexibility',
      description: 'Short-term or long-term stays. We adapt to your needs, not the other way around',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Trust & Safety',
      description: 'Verified properties, secure bookings, and reliable support every step of the way',
    },
  ]

  const stats = [
    { number: '500+', label: 'Verified Properties', icon: <Home className="w-6 h-6" /> },
    { number: '10,000+', label: 'Happy Renters', icon: <Users className="w-6 h-6" /> },
    { number: '4.8', label: 'Average Rating', icon: <Star className="w-6 h-6" /> },
    { number: '50+', label: 'Cities Across Nepal', icon: <MapPin className="w-6 h-6" /> },
  ]

  const testimonials = [
    {
      name: 'Sita Maharjan',
      location: 'Kathmandu',
      role: 'Student',
      text: 'Found my perfect apartment in Thamel within days! The Rent Confidence Score helped me choose the best option.',
      rating: 5
    },
    {
      name: 'Rajesh Shrestha',
      location: 'Pokhara',
      role: 'Professional',
      text: 'FairFlex pricing saved me thousands on my 6-month stay. The platform is so easy to use and trustworthy.',
      rating: 5
    },
    {
      name: 'Anita Tamang',
      location: 'Lalitpur',
      role: 'Family',
      text: 'As a family, we needed something verified and safe. RentNest made finding our home stress-free.',
      rating: 5
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            About RentNest
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
            Making rental housing accessible, transparent, and stress-free across Nepal
          </p>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-xl mb-4">
                  <div className="text-indigo-600">{stat.icon}</div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* About Section */}
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <div className="space-y-5 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>
                RentNest is Nepal's leading flexible rental platform, designed to make finding your perfect home 
                simple, transparent, and stress-free. Whether you're a student looking for a semester stay, a 
                professional on a work assignment, or a family seeking a long-term home, we're here to help.
              </p>
              <p>
                Our platform combines innovative technology with a deep understanding of Nepal's rental market. 
                We've built tools like Rent Confidence Score, FairFlex pricing, and property comparison to help 
                you make informed decisions with confidence.
              </p>
              <p>
                Every property on RentNest is manually verified by our team. We connect renters with trusted 
                property owners, ensuring a safe, transparent, and fair rental experience for everyone.
              </p>
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 mb-12">
            <div className="flex items-center mb-6">
              <div className="bg-indigo-100 p-4 rounded-xl mr-4">
                <Heart className="w-7 h-7 text-indigo-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-base md:text-lg mb-4">
              To revolutionize Nepal's rental market by providing a transparent, fair, and flexible platform 
              that empowers renters to find their perfect stay while ensuring property owners receive fair 
              compensation.
            </p>
            <p className="text-gray-700 leading-relaxed text-base md:text-lg">
              We're committed to making housing accessible and stress-free for everyone—from students and 
              professionals to families—across all major cities in Nepal.
            </p>
          </div>

          {/* Features Section */}
          <div className="mb-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                What We Offer
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful features designed to make your rental journey smooth and informed
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
                    <div className="text-indigo-600">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Core Values */}
          <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 rounded-xl shadow-sm p-8 md:p-12 mb-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Our Core Values
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <div className="text-indigo-600">{value.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mb-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                What Our Users Say
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real experiences from renters across Nepal
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role} • {testimonial.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Get in Touch
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Have questions? We're here to help
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-base font-medium text-gray-900">support@rentnest.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-base font-medium text-gray-900">+977 1-234-5678</p>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link
                to="/houses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Browse Properties</span>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default About
